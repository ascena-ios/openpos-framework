import { MatSidenav } from '@angular/material/sidenav';
import { BaconStripInterface } from './bacon-strip.interface';
import { ScreenPartComponent } from '../screen-part';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ScreenPart } from '../../decorators/screen-part.decorator';
import { HelpTextService } from '../../../core/help-text/help-text.service';
import { MediaBreakpoints, OpenposMediaService } from '../../../core/media/openpos-media.service';
import { Observable } from 'rxjs';
import { KeyPressProvider } from '../../providers/keypress.provider';
import { CONFIGURATION } from '../../../configuration/configuration';

@ScreenPart({
    name: 'baconStrip'
})
@Component({
    selector: 'app-bacon-strip',
    templateUrl: './bacon-strip.component.html',
    styleUrls: ['./bacon-strip.component.scss']
})
export class BaconStripComponent extends ScreenPartComponent<BaconStripInterface> implements OnInit {

    iconButtonName: string;

    @ViewChild(MatSidenav, { static: true })
    baconDrawer: MatSidenav;

    get sidenavOpened(): boolean {
        return this.baconDrawer.opened;
    }

    @Input()
    set sidenavOpened(opened: boolean) {
        if (this.baconDrawer) {
            this.baconDrawer.opened = opened;
            this.changeDetector.detectChanges();
        }
    }

    @Output()
    readonly sidenavOpenedChange = new EventEmitter<boolean>();

    isMobile: Observable<boolean>;

    searchExpanded = false;

    @Input()
    searchEnabled = false;

    constructor(
        injector: Injector,
        public helpTextService: HelpTextService,
        private media: OpenposMediaService,
        protected keyPresses: KeyPressProvider,
        private changeDetector: ChangeDetectorRef
    ) {
        super(injector);

        this.isMobile = media.observe(new Map([
            [MediaBreakpoints.MOBILE_PORTRAIT, true],
            [MediaBreakpoints.MOBILE_LANDSCAPE, true],
            [MediaBreakpoints.TABLET_PORTRAIT, false],
            [MediaBreakpoints.TABLET_LANDSCAPE, false],
            [MediaBreakpoints.DESKTOP_PORTRAIT, false],
            [MediaBreakpoints.DESKTOP_LANDSCAPE, false]
        ]));

        this.subscriptions.add(
            this.keyPresses.subscribe('Escape', 100, (event: KeyboardEvent) => {
                // ignore repeats and check configuration
                if (event.repeat || event.type !== 'keydown' || !CONFIGURATION.enableKeybinds) {
                    return;
                }
                if (event.type === 'keydown' && this.screenData.actions) {
                    this.buttonClick();
                }
            })
        );
    }

    ngOnInit() {
        super.ngOnInit();

        if (this.baconDrawer) {
            this.baconDrawer.openedChange.subscribe(v => {
                this.sidenavOpenedChange.next(v);
                this.changeDetector.detectChanges();
            });
        }
    }

    screenDataUpdated() {
        if (this.screenData.actions && this.screenData.actions.length === 1) {
            this.iconButtonName = this.screenData.actions[0].icon;
        } else if (this.screenData.actions) {
            this.iconButtonName = 'menu';
        } else {
            this.iconButtonName = this.screenData.icon;
        }
    }

    buttonClick() {
        if (this.screenData.actions && this.screenData.actions.length === 1) {
            this.doAction(this.screenData.actions[0]);
        } else {
            this.baconDrawer.toggle();
            this.changeDetector.detectChanges();
        }
    }

    onSearchExpand(expanded: boolean): void {
        this.searchExpanded = expanded;
    }
}
