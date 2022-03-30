import { SelectionListInterface } from './selection-list.interface';
import { PosScreenDirective } from '../pos-screen/pos-screen.component';
import type { QueryList } from '@angular/core';
import { AfterViewInit, Directive, ElementRef, Injector, ViewChildren } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { ISelectableListData } from '../../shared/components/selectable-item-list/selectable-list-data.interface';
import { SelectableItemListComponentConfiguration } from '../../shared/components/selectable-item-list/selectable-item-list.component';
import { SelectionMode } from '../../core/interfaces/selection-mode.enum';
import { SessionService } from '../../core/services/session.service';
import { filter, map } from 'rxjs/operators';
import { IActionItem } from '../../core/actions/action-item.interface';
import { CONFIGURATION } from '../../configuration/configuration';
import { SelectableItemInterface } from './selectable-item.interface';
import { KeybindingZoneService } from '../../core/keybindings/keybinding-zone.service';

@Directive()
export class GenericSelectionListScreenDirective<T extends SelectableItemInterface>
    extends PosScreenDirective<SelectionListInterface<T>> implements AfterViewInit {
    @ViewChildren('items') private items: QueryList<ElementRef>;

    listData: Observable<ISelectableListData<T>>;
    listConfig: SelectableItemListComponentConfiguration;
    selectionMode: SelectionMode;
    index = -1;
    indexes = [];
    lastSelection = -1;
    previousIndexes = [];
    selectedItem: T;
    selectedItems: T[];

    private keybindingZoneService: KeybindingZoneService;
    private screenData$ = new BehaviorSubject<ISelectableListData<T>>(null);

    constructor(injector: Injector, private session: SessionService) {
        super(injector);
        this.keybindingZoneService = injector.get(KeybindingZoneService);
        this.listData = merge(this.session.getMessages('UIData').pipe(
            filter(d => d.dataType === 'SelectionListData'),
            map((d) => {
                const items = new Map<number, T>();
                const disabledItems = new Map<number, T>();
                Object.getOwnPropertyNames(d.items).forEach(element => {
                    items.set(Number(element), d.items[element]);
                });
                Object.getOwnPropertyNames(d.disabledItems).forEach(element => {
                    disabledItems.set(Number(element), d.disabledItems[element]);
                });
                d.items = items;
                d.disabledItems = disabledItems;
                return d;
            })
        ), this.screenData$);
    }

    buildScreen(): void {
        if (this.screen.selectionList && this.screen.selectionList.length > 0) {
            const allItems = new Map<number, T>();
            const allDisabledItems = new Map<number, T>();
            for (let i = 0; i < this.screen.selectionList.length; i++) {
                const item = this.screen.selectionList[i];
                allItems.set(i, item);
                if (!item.enabled) {
                    allDisabledItems.set(i, item);
                }
            }
            this.screenData$.next({
                    items: allItems,
                    disabledItems: allDisabledItems,
                } as ISelectableListData<T>
            );

            if (this.screen.selectionList && (this.screen.fetchDataAction === undefined || this.screen.fetchDataAction === null)) {
                if (this.screen.multiSelect) {
                    this.selectedItems = this.screen.selectionList.filter(item => item.selected);
                    this.indexes = [];
                    this.selectedItems.forEach(i => this.indexes.push(this.screen.selectionList.indexOf(i)));
                } else {
                    this.selectedItem = this.screen.selectionList.find(item => item.selected);
                    this.index = this.screen.selectionList.indexOf(this.selectedItem);
                }
            }
        }

        this.listConfig = new SelectableItemListComponentConfiguration();
        if (this.screen.numberItemsPerPage <= 0) {
            this.listConfig.numItemsPerPage = Number.MAX_VALUE;
        } else {
            this.listConfig.numItemsPerPage = this.screen.numberItemsPerPage;
        }
        if (this.screen.selectionList && this.screen.selectionList.length > 0) {
            this.listConfig.totalNumberOfItems = this.screen.selectionList.length;
        } else {
            this.listConfig.totalNumberOfItems = this.screen.numberTotalItems;
        }
        this.listConfig.defaultSelectItemIndex = this.screen.defaultSelectItemIndex;
        this.listConfig.selectionMode = this.screen.multiSelect ? SelectionMode.Multiple : SelectionMode.Single;
        this.listConfig.fetchDataAction = this.screen.fetchDataAction;
    }

    ngAfterViewInit(): void {
        this.items.changes.subscribe(() => {
            console.log('changed');
        });
    }

    onItemListChange(event: any[]): void {
        this.indexes = event;

        if (this.screen.selectionChangedAction && this.indexes !== this.previousIndexes) {
            this.previousIndexes = this.indexes;
            this.doAction(this.screen.selectionChangedAction, this.indexes);
        }
    }

    onItemChange(event: any): void {
        this.index = event;

        if (this.screen.selectionChangedAction && this.index !== this.lastSelection) {
            this.lastSelection = this.index;
            this.doAction(this.screen.selectionChangedAction, this.index);
        }
    }

    doSelectionButtonAction(menuItem: IActionItem): void {
        if (!this.isSelectionDisabled()) {
            this.doMenuItemAction(menuItem);
        }
    }

    doNonSelectionButtonAction(menuItem: IActionItem): void {
        if (this.isSelectionDisabled() || this.screen.allowNonSelectButtonWhenSelected) {
            this.doMenuItemAction(menuItem);
        }
    }

    protected doMenuItemAction(menuItem: IActionItem): void {
        if (this.screen.multiSelect) {
            this.doAction(menuItem, this.indexes);
        } else {
            this.doAction(menuItem, this.index);
        }
    }

    keybindsEnabled(menuItem: IActionItem): boolean {
        return CONFIGURATION.enableKeybinds && menuItem.keybind && menuItem.keybind !== 'Enter';
    }

    isSelectionDisabled(): boolean {
        return this.index < 0 && (this.indexes === undefined || this.indexes === null || this.indexes.length === 0);
    }

    getItemActionPayload(): number[] | number {
        return this.screen.multiSelect ? this.indexes : this.index;
    }
}
