import { Injectable, Type, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { IScreen } from '../../shared/components/dynamic-screen/screen.interface';
import { PersonalizationService } from '../personalization/personalization.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ScreenService {

    static screens = new Map<string, Type<IScreen>>();

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private http: HttpClient,
        private personalization: PersonalizationService,
        private discovery: DiscoveryService
    ) { }

    public addScreen(name: string, type: Type<IScreen>): void {
        if (type === null) {
            throw new Error(`Cannot add null component for screen with name '${name}'`);
        }

        if (ScreenService.screens.get(name)) {
            // tslint:disable-next-line:max-line-length
            console.info(`replacing registration for screen of type ${ScreenService.screens.get(name).name} with ${type.name} for the key of ${name} in the screen service`);
            ScreenService.screens.delete(name);
        }
        ScreenService.screens.set(name, type);
    }

    public hasScreen(name: string): boolean {
        return ScreenService.screens.has(name);
    }

    public resolveScreen(type: string, theme: string): ComponentFactory<IScreen> {
        const themeScreen = type + '_' + theme;
        let screenType: Type<IScreen>;
        if (this.hasScreen(themeScreen)) {
            screenType = ScreenService.screens.get(themeScreen);
        } else {
            screenType = ScreenService.screens.get(type);
        }
        if (screenType) {
            return this.componentFactoryResolver.resolveComponentFactory(screenType);
        } else {
            console.error(`Could not find a screen type of: ${type}.  Please register it with the screen service`);
            return this.resolveScreen('Blank', theme);
        }
    }

    public getFieldValues(fieldId: string, searchTerm?: string): Observable<any> {
        const url: string = this.discovery.getApiServerBaseURL() + '/app/'
            + this.personalization.getAppId$().getValue() + '/node/'
            + this.personalization.getDeviceId$().getValue() + '/control/'
            + fieldId;

        const httpParams: any = {};
        if (searchTerm) {
            httpParams.searchTerm = searchTerm;
        }
        console.info(`Requesting field values from the server using url: ${url}, params: '${JSON.stringify(httpParams)}'`);
        return this.http.get(url, { params: httpParams }).pipe(
            catchError(err => {
                console.error(`Failed to get field values for url: '${url}'. Error: ${JSON.stringify(err)}`);
                return throwError(err);
            })
        );
    }

}


