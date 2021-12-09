import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LocaleConstantKey, LOCALE_CONSTANTS } from './locale.constants';
import { SessionService } from './session.service';
import { PersonalizationService } from '../personalization/personalization.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, distinct, tap } from 'rxjs/operators';

export const DEFAULT_LOCALE = 'en-US';

@Injectable({
    providedIn: 'root',
})
export class LocaleService {
    private supportedLocales = ['en-US'];
    private showIcons = true;
    private textCache = new Map<string, string>();

    private locale$ = new BehaviorSubject<string>(DEFAULT_LOCALE);
    private displayLocale$ = new BehaviorSubject<string>(DEFAULT_LOCALE);

    constructor(
        public sessionService: SessionService,
        private http: HttpClient,
        private personalization: PersonalizationService
    ) {
        this.sessionService.getMessages('LocaleChanged').subscribe(message => this.handleLocaleChanged(message));
    }

    handleLocaleChanged(message: any) {
        if (message.locale) {
            this.locale$.next(this.formatLocaleForBrowser(message.locale));
        }
        if (message.displayLocale) {
            this.displayLocale$.next(this.formatLocaleForBrowser(message.displayLocale));
        }
        if (message.supportedLocales) {
            this.supportedLocales = message.supportedLocales.map(locale => this.formatLocaleForBrowser(locale));
        }
        if (message.hasOwnProperty('showIcons')) {
            this.showIcons = message.showIcons;
        }
    }

    getString(base: string, key: string, args?: any[]): Observable<string> {
        const cacheKey = base + ':' + key + (args ? args.join(':') : '');
        const text = this.textCache.get(cacheKey);
        if (text) {
            console.debug(`using cached i18n value for ${cacheKey} = ${text}`);
            return of(text);
        } else {
            const url = `http${this.personalization.getSslEnabled$().getValue() ? 's' : ''}` +
                `://${this.personalization.getServerName$().getValue()}:` +
                `${this.personalization.getServerPort$().getValue()}/rest/i18n/value`;

            return this.displayLocale$.pipe(
                distinct(), switchMap(l => this.http.post(url, {
                    base,
                    key,
                    locale: this.formatLocaleForJava(l),
                    args
                }, {
                    responseType: 'text',
                })), tap(v => this.textCache.set(cacheKey, v))
            );
        }
    }

    getLocale(): string {
        return this.locale$.getValue();
    }

    getDisplayLocale(): string {
        return this.displayLocale$.getValue();
    }

    getSupportedLocales(): string[] {
        return this.supportedLocales;
    }

    isShowIcons() {
        return this.showIcons;
    }

    getConstant(key: LocaleConstantKey, locale?: string): any {
        let llocale = locale || this.getLocale();
        llocale = llocale ? llocale.toLowerCase() : null;
        if (LOCALE_CONSTANTS[key] && llocale) {
            return LOCALE_CONSTANTS[key][llocale];
        } else {
            return null;
        }
    }

    formatLocaleForBrowser(locale: string): string {
        if (locale) {
            return locale.replace('_', '-');
        } else {
            return null;
        }
    }

    formatLocaleForJava(locale: string): string {
        if (locale) {
            return locale.replace('-', '_');
        } else {
            return null;
        }
    }

}


