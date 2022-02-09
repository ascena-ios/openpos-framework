import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { StorageContainer } from '../storage-container';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService implements StorageContainer {
    name(): string {
        return 'localStorage';
    }

    isAvailable(): Observable<boolean> {
        return of(true);
    }

    isSupported(): boolean {
        return true;
    }

    getValue(key: string): Observable<string | undefined> {
        const value = localStorage.getItem(key);

        if (!value) {
            return of(undefined);
        }

        return of(value);
    }

    setValue(key: string, value: string): Observable<void> {
        localStorage.setItem(key, value);
        return EMPTY;
    }

    remove(key: string): Observable<void> {
        localStorage.removeItem(key);
        return EMPTY;
    }

    clear(): Observable<void> {
        localStorage.clear();
        return EMPTY;
    }
}
