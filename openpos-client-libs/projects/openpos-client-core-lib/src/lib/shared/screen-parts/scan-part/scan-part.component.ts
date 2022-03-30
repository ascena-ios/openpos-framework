import { FocusService } from '../../../core/focus/focus.service';
import { ScreenPart } from '../../decorators/screen-part.decorator';
import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { ScreenPartComponent } from '../screen-part';
import { OnBecomingActive } from '../../../core/life-cycle-interfaces/becoming-active.interface';
import { OnLeavingActive } from '../../../core/life-cycle-interfaces/leaving-active.interface';
import { Subscription } from 'rxjs';
import { ScanInterface } from './scan-part.interface';
import { BarcodeScanner } from '../../../core/platform-plugins/barcode-scanners/barcode-scanner.service';

@ScreenPart({
    name: 'scan'
})
@Component({
    selector: 'app-scan-part',
    templateUrl: './scan-part.component.html',
    styleUrls: ['./scan-part.component.scss']
})
export class ScanPartComponent extends ScreenPartComponent<ScanInterface> implements
    OnInit, OnDestroy, OnBecomingActive, OnLeavingActive {

    private scanServiceSubscription: Subscription;

    constructor(injector: Injector, private scannerService: BarcodeScanner, private focusService: FocusService) {
        super(injector);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.registerScanner();
    }

    onBecomingActive() {
        this.registerScanner();
    }

    onLeavingActive() {
        this.unregisterScanner();
    }

    ngOnDestroy(): void {
        this.unregisterScanner();
        // this.scannerService.stopScanning();
        super.ngOnDestroy();
    }

    private registerScanner() {
        if (typeof this.scanServiceSubscription === 'undefined' || this.scanServiceSubscription === null) {
            console.log(`Registering scan-part scanner...`);
            this.scanServiceSubscription = this.scannerService.beginScanning().subscribe(scanData => {
                if (this.screenData.scanActionName) {
                    // Do this so that we complete any changes we've already made
                    console.log(`Received scan data...`);
                    this.focusService.blurCurrentElement();
                    // The setTimeout here makes sure that everything the event chain of
                    // the blur above finishes before the scan action executes because
                    // the timeout queues this up until the microqueue is drained. the
                    // timeout of 1 is to make sure that it gets queued after any other timeout - 0's
                    console.log(`Queueing scan send with a timeout...`);
                    setTimeout(() => this.doAction({ action: this.screenData.scanActionName, queueIfBlocked: true }, scanData), 1);
                }
            });
        }
    }

    private unregisterScanner() {
        if (this.scanServiceSubscription != null) {
            this.scanServiceSubscription.unsubscribe();
            this.scanServiceSubscription = null;
        }
    }

    screenDataUpdated() {
    }

}
