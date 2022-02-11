import {SessionService} from './session.service';
import {filter, map} from 'rxjs/operators';
import {Inject, Injectable, InjectionToken, OnDestroy, Optional} from '@angular/core';
import {ILocationProvider} from '../location-providers/location-provider.interface';
import {ILocationData} from '../location-providers/location-data.interface';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {ActionMessage} from '../messages/action-message';
import {ConfigurationService} from './configuration.service';

export const PROVIDERS = new InjectionToken<ILocationProvider[]>('LocationProviders');

@Injectable({
    providedIn: 'root',
})
export class LocationService implements OnDestroy {

    subscription: Subscription;
    $data = new BehaviorSubject<ILocationData>(null);
    previousLocationData: ILocationData;
    manualOverride = false;
    availableCountries: string[];

    constructor(private configurationService: ConfigurationService,
                public sessionService: SessionService,
                @Optional() @Inject(PROVIDERS) private locationProviders: Array<ILocationProvider>) {

        sessionService.getMessages('ConfigChanged').pipe(
            filter(m => m.configType === 'LocationService')
        ).subscribe(message => {
            if (message.enabled === 'true') {
                console.info(`LocationService config received: ${JSON.stringify(message)}`);
                if (message.countries) {
                    this.availableCountries = message.countries.split(',');
                }
                let provider = locationProviders.find(l => l.getProviderName() === message.provider);
                if (provider === undefined || provider === null) {
                    provider = locationProviders.find(l => l.getProviderName() === 'default');
                }
                if (this.subscription) {
                    this.subscription.unsubscribe();
                }
                this.subscription = provider.getCurrentLocation(message.coordinateBuffer ? message.coordinateBuffer : 0)
                .subscribe((locationData: ILocationData) => {
                    if (!this.manualOverride) {
                        console.info(`[LocationService] Sending locationData: ${JSON.stringify(locationData)}`);
                        sessionService.sendMessage( new ActionMessage('LocationChanged', true, locationData ));
                        this.$data.next(locationData);
                        this.previousLocationData = locationData;
                    }
                });
            }
        });
    }

    hasManualOverride(): boolean {
        return this.manualOverride;
    }

    getAvailableCountries(): string[] {
        return this.availableCountries;
    }

    getPostalCode(): Observable<string> {
        return this.$data.pipe(map(l => l === null ? null : l.postalCode));
    }

    setLocationData(locationData: ILocationData): void {
        if (locationData && locationData.postalCode && locationData.country) {
            this.manualOverride = true;
            this.$data.next(locationData);
            this.previousLocationData = locationData;
            this.sessionService.sendMessage(new ActionMessage('LocationChanged', true, locationData));
        } else {
            this.manualOverride = false;
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
