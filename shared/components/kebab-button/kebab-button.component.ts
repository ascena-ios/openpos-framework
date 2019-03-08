import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { IActionItem, Logger } from '../../../core';
import { MatDialog } from '@angular/material';
import { KebabMenuComponent } from '../kebab-menu/kebab-menu.component';
import { KeyPressProvider } from '../../providers/keypress.provider';
import { Configuration } from '../../../configuration/configuration';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-kebab-button',
    templateUrl: './kebab-button.component.html',
    styleUrls: ['./kebab-button.component.scss']
})
export class KebabButtonComponent implements OnDestroy {

    @Input()
    menuItems: IActionItem[];

    @Input()
    color?: string;

    @Input()
    set keyBinding( key: string) {
        if ( this.subscription ) {
            this.subscription.unsubscribe();
        }

        this.subscription = this.keyPresses.subscribe( key, 100, event => {
            // ignore repeats
            if ( event.repeat || !Configuration.enableKeybinds ) {
                return;
            }
            if (event.type === 'keydown') {
                this.openKebabMenu();
            }
        });
    }

    @Output()
    menuItemClick = new EventEmitter<IActionItem>();

    private subscription: Subscription;

    constructor(private dialog: MatDialog, private keyPresses: KeyPressProvider) {
    }


    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public openKebabMenu() {
        const dialogRef = this.dialog.open(KebabMenuComponent, {
            data: {
                menuItems: this.menuItems,
                payload: null,
                disableClose: false,
                autoFocus: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.menuItemClick.emit(result);
            }
        });
    }
}
