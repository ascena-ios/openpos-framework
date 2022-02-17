import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, concat, defer, iif, of } from 'rxjs';
import { bufferTime, catchError, filter, map, mergeMap, publishReplay, refCount, switchMap } from 'rxjs/operators';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigChangedMessage } from '../../messages/config-changed-message';
import { PersonalizationService } from '../../personalization/personalization.service';
import { SessionService } from '../../services/session.service';
import { ConsoleScraper, LogLevel } from '../console-scraper.service';
import { CapacitorService } from '../../services/capacitor.service';

export interface NewRelicMessageGroup {
    common?: { [key: string]: any };
    logs: NewRelicLogMessage[];
}

export interface NewRelicLogMessage {
    timestamp?: number;
    message: string;
    log_level?: LogLevel;

    // attributes
    [key: string]: any;
}

export class NewRelicLoggerConfig extends ConfigChangedMessage {
    enabled: boolean;
    apiKey?: string;

    constructor() {
        super('new-relic-logger');
    }
}

@Injectable({ providedIn: 'root' })
export class NewRelicSink {
    constructor(
        consoleScraper: ConsoleScraper,
        http: HttpClient,
        config: ConfigurationService,
        personalization: PersonalizationService,
        sessionService: SessionService,
        capacitorService: CapacitorService
    ) {
        config.getConfiguration<NewRelicLoggerConfig>('new-relic-logger').pipe(
            map(v => ({ enabled: v.enabled, apiKey: v.apiKey })),
        ).pipe(
            switchMap(newRelicLogger => iif(
                () => newRelicLogger && newRelicLogger.enabled && !!newRelicLogger.apiKey,

                defer(() => combineLatest([
                    of(newRelicLogger),
                    personalization.getAppId$(),
                    personalization.getDeviceId$(),
                    personalization.getServerName$(),
                    personalization.getServerPort$(),
                    concat(
                        of('none'),
                        sessionService.screenMessage$.pipe(map(s => s.screenType)),
                    ),
                    iif(
                        () => capacitorService.isRunningInCapacitor(),
                        defer(() => capacitorService.getDeviceName()),
                        of(undefined)
                    ),
                    consoleScraper.messages$.pipe(
                        map(cm => ({
                            log_level: cm.level,
                            message: cm.message.substring(0, Math.min(cm.message.length, 4098)),
                            timestamp: Math.round(Date.now())
                        }) as NewRelicLogMessage),
                        publishReplay(100, 5000),
                        refCount()
                    )
                ]).pipe(
                    map(c => ({
                        timestamp: c[7].timestamp,
                        config: c[0],
                        app_id: c[1] || undefined,
                        device_id: c[2] || undefined,
                        server_name: c[3] || undefined,
                        server_port: c[4] || undefined,
                        screen: c[5],
                        physical_device_name: c[6],
                        message: c[7].message,
                        log_level: c[7].log_level
                    })),
                    filter(g => !!g.config && g.config.enabled && !!g.config.apiKey),
                    bufferTime(1000),
                    filter(logs => logs.length > 0),
                    map(logs => ({
                        apiKey: logs[0].config.apiKey,
                        groups: Array.of({
                            logs: logs.map(v => ({
                                ...v,
                                config: undefined,
                            }))
                        })
                    })),
                    mergeMap(request => http.post(
                        'https://log-api.newrelic.com/log/v1',
                        request.groups,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Api-Key': request.apiKey
                            }
                        }).pipe(
                            catchError(() => of())
                        )
                    )
                )),

                of()
            )),
        ).subscribe();
    }
}
