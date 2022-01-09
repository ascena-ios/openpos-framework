import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Scanner, ScanData, ScanDataType } from '../scanner';

declare global {
    interface Console {
        scan?: (type: ScanDataType, data: string) => void;
        scanData?: (type: ScanData) => void;
    }
}

@Injectable({
    providedIn: 'root'
})
export class ConsoleScannerPlugin implements Scanner {
    scanSubject = new Subject<ScanData>();

    constructor() {
        console.scan = (type, value) => {
            // support single argument scan like console.scan('123456')
            if (type?.match(/^\d/) && !value) {
                value = type;
                type = 'CODE128';
            }
            this.scanSubject.next({
                type,
                data: value
            });
        };

        console.scanData = (scanData: ScanData) => {
            this.scanSubject.next({ rawData: scanData.rawData, data: scanData.data, rawType: scanData.rawType, type: scanData.type });
        };
    }

    beginScanning(): Observable<ScanData> {
        return this.scanSubject.asObservable();
    }
}
