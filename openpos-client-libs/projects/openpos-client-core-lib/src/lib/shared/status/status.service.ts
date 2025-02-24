import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { ConfigChangedMessage } from '../../core/messages/config-changed-message';
import { MessageTypes } from '../../core/messages/message-types';
import { StatusMessage } from './status.message';
import { SessionService } from '../../core/services/session.service';
import { StatusDetailsService } from './status-details/status-details.service';
import { Power } from '../../core/platform-plugins/power/power.service';
import { PowerStatus } from '../../core/platform-plugins/power/power-supplier';

@Injectable({
    providedIn: 'root'
})
export class StatusService {

    private systemInfoConfig$ = new ReplaySubject<ConfigChangedMessage>(1);
    private latestStatus = new Map<string, StatusMessage>();
    private latestStatus$ = new ReplaySubject<Map<string, StatusMessage>>(1);

    constructor(
        private sessionService: SessionService,
        public statusDetailsService: StatusDetailsService,
        private powerService: Power
    ) {
        this.sessionService.getMessages(MessageTypes.STATUS).pipe(
            tap(message => console.log('Status Updated', message))
        ).subscribe(message => this.statusUpdated(message));
        this.sessionService.getMessages(MessageTypes.CONFIG_CHANGED).pipe(
            filter(message => (message as ConfigChangedMessage).configType === 'SystemInfo'),
            tap(message => console.log('SystemInfo Updated ', message))
        ).subscribe(message => this.configUpdated(message));
        this.powerService.observePowerStatus().subscribe((status: PowerStatus) => {
            this.sessionService.sendPowerStatus(status);
        });
    }

    public getStatus(): Observable<Map<string, StatusMessage>> {
        return this.latestStatus$;
    }

    public getSystemInfo(): Observable<ConfigChangedMessage> {
        return this.systemInfoConfig$;
    }

    private configUpdated(message: ConfigChangedMessage) {
        this.systemInfoConfig$.next(message);
    }

    private statusUpdated(message: StatusMessage) {
        this.latestStatus.set(message.id, message);
        this.latestStatus$.next(this.latestStatus);
    }
}
