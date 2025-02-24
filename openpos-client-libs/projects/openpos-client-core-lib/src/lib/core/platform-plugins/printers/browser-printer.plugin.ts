import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPrinter } from './printer.interface';

@Injectable({
    providedIn: 'root'
})
export class BrowserPrinterPlugin implements IPrinter {
    name(): string {
        return 'browser-print';
    }

    isSupported(): boolean {
        return true;
    }

    print(html: string): Observable<void> {
        return new Observable(observer => {
            const hiddenPrintFrame = document.createElement('iframe');

            hiddenPrintFrame.onload = e => {
                const frame = e.target as HTMLIFrameElement;
                const contentWindow = frame.contentWindow;
                contentWindow.onbeforeunload = () => {
                    document.body.removeChild(hiddenPrintFrame);
                };

                contentWindow.onafterprint = () => {
                    observer.next();
                    observer.complete();

                    document.body.removeChild(hiddenPrintFrame);
                };

                contentWindow.focus();
                contentWindow.print();
            };

            hiddenPrintFrame.style.position = 'fixed';
            hiddenPrintFrame.style.right = '0';
            hiddenPrintFrame.style.bottom = '0';
            hiddenPrintFrame.style.width = '0';
            hiddenPrintFrame.style.height = '0';
            hiddenPrintFrame.style.border = '0';
            hiddenPrintFrame.srcdoc = html;

            document.body.appendChild(hiddenPrintFrame);
        });
    }
}
