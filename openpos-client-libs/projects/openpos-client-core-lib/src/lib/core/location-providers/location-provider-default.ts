import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ILocationProvider, LocationProviderConfigChanged } from './location-provider.interface';
import { ILocationData } from './location-data.interface';
import { CONFIGURATION } from '../../configuration/configuration';
import { ConfigurationService } from '../services/configuration.service';
import { filter, take } from 'rxjs/operators';

interface GoogleGeocodeResponse {
    results: GoogleGeocodeResult[];
}

interface GoogleGeocodeResult {
    address_components: GoogleAddressComponent[];
}

interface GoogleAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

@Injectable({
    providedIn: 'root'
})
export class LocationProviderDefault implements ILocationProvider {
    coordinateBuffer: number;
    private $locationData = new BehaviorSubject<ILocationData>(null);

    constructor(private http: HttpClient, private configurationService: ConfigurationService) {
        this.configurationService.getConfiguration('uiConfig')
            .pipe(filter(config => Object.keys(config).includes('googleApiKey')), take(1))
            .subscribe((config: LocationProviderConfigChanged) => {
                if (this.coordinateBuffer != null) {
                    this.getCurrentLocation(this.coordinateBuffer, config.googleApiKey);
                }
            });
    }

    getProviderName(): string {
        return 'default';
    }

    getCurrentLocation(buffer: number, googleApiKey?: string): Observable<ILocationData> {
        this.coordinateBuffer = buffer;
        if (navigator.geolocation && (CONFIGURATION.googleApiKey || googleApiKey)) {
            let zipCode = '';
            let countryName = '';
            const previous = { latitude: 0, longitude: 0 };
            navigator.geolocation.watchPosition((position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                if (lat > previous.latitude + this.coordinateBuffer || lat < previous.latitude - this.coordinateBuffer
                    || long > previous.longitude + this.coordinateBuffer || long < previous.longitude - this.coordinateBuffer) {
                    previous.latitude = lat;
                    previous.longitude = long;
                    const latlong = `${lat},${long}`;
                    console.log('calling google maps geocode api');
                    this.reverseGeocode(CONFIGURATION.googleApiKey, latlong)
                        .then((response) => {
                            console.log(response.results[0].address_components);
                            for (const addressComponent of response.results[0].address_components) {
                                for (const type of addressComponent.types) {
                                    if (type === 'postal_code') {
                                        zipCode = addressComponent.long_name;
                                    }
                                    if (type === 'country') {
                                        countryName = addressComponent.long_name;
                                    }
                                }
                            }

                            this.$locationData.next({
                                type: 'default',
                                postalCode: zipCode,
                                latitude: lat.toString(),
                                longitude: long.toString(),
                                country: countryName
                            } as ILocationData);
                        })
                        .catch((error) => console.log(error));
                }
            });
        }
        return this.$locationData;
    }

    reverseGeocode(key: string, param: string): Promise<GoogleGeocodeResponse> {
        try {
            return this.http
                .get<GoogleGeocodeResponse>('https://maps.google.com/maps/api/geocode/json?key=' + key + '&latlng=' + param + '&sensor=false')
                .toPromise();
        } catch (error) {
            return Promise.resolve(error.json());
        }
    }

    private extractZipAndCountry(googleResponse: GoogleGeocodeResponse): void {
        let zipCode = '';
        let countryName = '';
        console.log(googleResponse.results[0].address_components);
        for (const addressComponent of googleResponse.results[0].address_components) {
            for (const type of addressComponent.types) {
                if (type === 'postal_code') {
                    zipCode = addressComponent.long_name;
                }
                if (type === 'country') {
                    countryName = addressComponent.long_name;
                }
            }
        }

        this.$locationData.next({
            type: 'default',
            postalCode: zipCode,
            country: countryName
        } as ILocationData);
    }
}
