import {catchError, first, flatMap, take, tap, timeout} from 'rxjs/operators';
import {IStartupTask} from './startup-task.interface';
import {PersonalizationService} from '../personalization/personalization.service';
import {concat, Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material';
import {Injectable} from '@angular/core';
import {StartupTaskData} from './startup-task-data';
import {PersonalizationComponent} from '../personalization/personalization.component';
import {Zeroconf, ZeroconfService} from "@ionic-native/zeroconf";
import {StartupTaskNames} from "./startup-task-names";
import {WrapperService} from "../services/wrapper.service";
import {Configuration} from "../../configuration/configuration";


@Injectable({
    providedIn: 'root',
})
export class AutoPersonalizationStartupTask implements IStartupTask {
    name = StartupTaskNames.AUTO_PERSONALIZATION;
    order = 500;
    private readonly TYPE = '_jmc-personalize._tcp.';
    private readonly DOMAIN = 'local.';

    constructor(protected personalization: PersonalizationService, protected matDialog: MatDialog, protected wrapperService: WrapperService) {
    }

    execute(data: StartupTaskData): Observable<string> {
        console.log('[AutoPersonalizationTask] started')
        if (this.personalization.shouldAutoPersonalize()) {
            if (this.personalization.hasSavedSession()) {
                console.log('[AutoPersonalizationTask] saved session exists, personalizing with it')
                return this.personalization.personalizeFromSavedSession().pipe(
                    catchError(e => {
                        this.logPersonalizationError(e);
                        return this.manualPersonalization();
                    }));
            } else {
                return this.personalizeUsingZeroConf();
                // For testing locally in a browser ensure shouldAutoPersonalize() returns true
                // and use this personalizeUsingZeroConfMock() method instead
                // return this.personalizeUsingZeroConfMock();
            }
        } else {
            return of("No auto personalization available for device");
        }
    }

/*
    // Switch to this method if you need to test auto personalization
    // locally in your browser
    personalizeUsingZeroConfMock(): Observable<string> {
        let name: string = null;
        return of("jason_device").pipe(
            tap(deviceName => name = deviceName),
            flatMap(() => {
                const url = `localhost:6140/rest/admin/personalizeMe`;
                return this.attemptAutoPersonalize(url, name);
            })
        );
    }
*/
    personalizeUsingZeroConf(): Observable<string> {
        let name: string = null;

        let serviceConfig: ZeroconfService = null;

        console.log('[AutoPersonalizationTask] Starting ZeroConf watch on device ', this.wrapperService.getDeviceName());

        return Zeroconf.watch(this.TYPE, this.DOMAIN).pipe(
            timeout(Configuration.autoPersonalizationRequestTimeoutMillis),
            first(conf => conf.action === 'resolved'),
            tap(conf => {
                serviceConfig = conf.service;
                console.log('[AutoPersonalizationTask] service resolved', conf.service);
            }),
            flatMap(() => this.wrapperService.getDeviceName()),
            tap(deviceName => name = deviceName),
            flatMap(() => {
                const url = `${serviceConfig.hostname}:${serviceConfig.port}/${serviceConfig.txtRecord.path}`;
                return this.attemptAutoPersonalize(url, name);
            }),
            catchError(e => {
                this.logPersonalizationError(e);
                return this.personalizeWithHostname();
            })
        );

    }

    personalizeWithHostname(): Observable<string> {
        const servicePath = Configuration.autoPersonalizationServicePath;
        if (!!servicePath) {
            let name: string = null;
            return concat(
                of("Attempting to retrieve personalization params via hostname"),
                this.wrapperService.getDeviceName().pipe(
                    tap(deviceName => name = deviceName),
                    flatMap(() => this.attemptAutoPersonalize(Configuration.autoPersonalizationServicePath, name)),
                    catchError(e => {
                        this.logPersonalizationError(e);
                        return this.manualPersonalization();
                    })),
            );
        } else {
            return this.manualPersonalization();
        }
    }

    manualPersonalization(): Observable<string> {
        return concat(
            of("Auto-personalization failed, reverting to manual personalization"),
            this.matDialog.open(
                PersonalizationComponent, {
                    disableClose: true,
                    hasBackdrop: false,
                    panelClass: 'openpos-default-theme'
                }
            ).afterClosed().pipe(take(1)));
    }


    private attemptAutoPersonalize(url: string, deviceName: string): Observable<string> {
        return this.personalization.getAutoPersonalizationParameters(deviceName, url)
            .pipe(
                flatMap(info => {
                    if (info) {
                        // Handle case when personalizationParams come through as a Javascript object
                        if (info.personalizationParams && ! (info.personalizationParams instanceof Map)) {
                            info.personalizationParams = new Map<string, string>(Object.entries(info.personalizationParams));
                        }
                        return this.personalization.personalize(
                            info.serverAddress,
                            info.serverPort,
                            info.deviceId,
                            info.appId,
                            info.personalizationParams,
                            info.sslEnabled).pipe(
                            catchError(e => {
                                this.logPersonalizationError(e);
                                return this.manualPersonalization();
                            })
                        );
                    }
                    return this.manualPersonalization();
                }),
                catchError(e => {
                    this.logPersonalizationError(e);
                    return this.manualPersonalization();
                }));
    }

    private logPersonalizationError(error: any): void {
        console.log("[AutoPersonalizationTask] Error during auto-personalization: " + JSON.stringify(error))
    }
}
