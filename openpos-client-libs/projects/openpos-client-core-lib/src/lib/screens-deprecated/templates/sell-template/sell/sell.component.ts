import { Component, ViewChild, HostListener, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SellScreenUtils, ISellScreen } from './sell-screen.interface';
import { ISellTemplate } from './sell-template.interface';
import { SellStatusSectionData } from '../sell-status-section/sell-status-section.data';
import { Configuration } from '../../../../configuration/configuration';
import { MatDialog } from '@angular/material';
import { ScreenComponent } from '../../../../shared/decorators/screen-component.decorator';
import { AbstractTemplate } from '../../../../core/components/abstract-template';
import { StatusBarData } from '../../../../shared/components/status-bar/status-bar-data';
import { OpenposMediaService } from '../../../../core/services/openpos-media.service';
import { IActionItem } from '../../../../core/interfaces/action-item.interface';
import { NavListComponent } from '../../../../shared/components/nav-list/nav-list.component';
import { HelpTextService } from '../../../../core/help-text/help-text.service';

/**
 * @ignore
 */
@ScreenComponent({
    name: 'Sell'
})
@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent extends AbstractTemplate<any> {

  template: ISellTemplate;
  screen: ISellScreen;
  statusBar: StatusBarData;
  statusSection: SellStatusSectionData;
  localMenuEnabled: boolean;

  @ViewChild('drawer') drawer;
  public drawerOpen: Observable<boolean>;
  public showDrawer = true;

  public drawerMode: Observable<string>;

  public smOrXs: Observable<boolean>;

  constructor(private mediaService: OpenposMediaService, protected dialog: MatDialog,
              public helpTextService: HelpTextService, injector: Injector) {
    super(injector);
  }

  show(screen: any) {
    this.screen = screen;
    this.template = screen.template;
    this.buildTemplate();
  }

  buildTemplate() {
    this.statusBar = SellScreenUtils.getStatusBar(this.screen);
    this.statusSection = SellScreenUtils.getStatusSection(this.template);
    if (this.template.localMenuItems && this.template.localMenuItems.length > 0) {
        this.initializeDrawerMediaSizeHandling();
        setTimeout(() => {
            this.localMenuEnabled = true;
          }, this.template.localMenuDelay);
      } else {
        this.drawerOpen = of(false);
        this.showDrawer = false;
      }
  }

  public doMenuItemAction(menuItem: IActionItem) {
    this.localMenuEnabled = false;
    if (this.isMenuItemEnabled(menuItem)) {
      this.actionService.doAction(menuItem);
    }
  }

  public isMenuItemEnabled(m: IActionItem): boolean {
    let enabled = m.enabled;
    if (m.action.startsWith('<') && this.session.isRunningInBrowser()) {
      enabled = false;
    }
    return enabled;
  }

  public openTransactionSubmenu() {
    let optionItems = [];
    optionItems = this.template.transactionMenuItems;
    const dialogRef = this.dialog.open(NavListComponent, {
      width: '70%',
      data: {
        optionItems: optionItems,
        payload: null,
        disableClose: false,
        autoFocus: false
     }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.log.info('The dialog was closed');
    });
  }

  private initializeDrawerMediaSizeHandling() {
    const openMap = new Map([
        ['xs', false],
        ['sm', true],
        ['md', true],
        ['lg', true],
        ['xl', true]
    ]);

    const modeMap = new Map([
        ['xs', 'over'],
        ['sm', 'side'],
        ['md', 'side'],
        ['lg', 'side'],
        ['xl', 'side']
      ]);

    const smOrXsMap = new Map([
      ['xs', true],
      ['sm', true],
      ['md', false],
      ['lg', false],
      ['xl', false]
    ]);

    this.drawerOpen = this.mediaService.mediaObservableFromMap(openMap);
    this.drawerMode = this.mediaService.mediaObservableFromMap(modeMap);
    this.smOrXs = this.mediaService.mediaObservableFromMap(smOrXsMap);
  }

  public enableMenuClose(): boolean {
    return Configuration.enableMenuClose;
  }

  public keybindsEnabled() {
    return Configuration.enableKeybinds;
  }

}
