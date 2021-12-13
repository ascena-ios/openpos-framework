import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, Injector, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavListComponent } from '../../shared/components/nav-list/nav-list.component';
import { PosScreen } from '../pos-screen/pos-screen.component';
import { IItem } from '../../core/interfaces/item.interface';
import { IActionItem } from '../../core/interfaces/action-item.interface';
import { SelectableItemListComponentConfiguration } from '../../shared/components/selectable-item-list/selectable-item-list.component';
import { ItemClickAction } from '../../shared/components/product-list/product-list.component';
import { SelectionMode } from '../../core/interfaces/selection-mode.enum';
import { ScreenComponent } from '../../shared/decorators/screen-component.decorator';
import { Observable } from 'rxjs';
import { ISelectableListData } from '../../shared/components/selectable-item-list/selectable-list-data.interface';

/**
 * @ignore
 */
@ScreenComponent({
    name: 'MultiselectItemList'
  })
@Component({
    selector: 'app-multiselect-item-list',
    templateUrl: './multiselect-item-list.component.html',
    styleUrls: ['./multiselect-item-list.component.scss']
})
export class MultiselectItemListComponent extends PosScreen<any> implements OnInit, AfterViewInit, AfterViewChecked {

    items: IItem[];
    itemActionName: string;
    text: string;
    itemActions: IActionItem[] = [];
    condensedListDisplay: false;
    selectionMode: string;

    @ViewChild('scrollList') private scrollList: ElementRef;
    public size = -1;
    initialized = false;
    listConfig = new SelectableItemListComponentConfiguration();
    listData: Observable<ISelectableListData<IItem>>;
    selectedItems: IItem[] = new Array<IItem>();
    individualMenuClicked = false;
    //  ----------------------------------

    private itemDisplayActionPresent = false;
    private addActionPresent = false;
    private nextActionPresent = false;


    constructor(protected dialog: MatDialog, injector: Injector, public vcRef: ViewContainerRef) {
        super(injector);
    }

    buildScreen() {

        this.items = this.screen.items;
        this.itemActionName = this.screen.itemActionName;
        this.text = this.screen.text;
        this.itemActions = this.screen.itemActions;
        this.condensedListDisplay = this.screen.condensedListDisplay;
        this.selectionMode = this.screen.selectionMode;

        //  Copied from transaction.component buildScreen() method...
        const allItems = new Map<number, IItem>();
        const allDisabledItems = new Map<number, IItem>();
        for (let i = 0; i < this.screen.items.length; i++) {
            const item = this.screen.items[i];
            allItems.set(i, item);
            if (!item.enabled) {
                allDisabledItems.set(i, item);
            }
        }

        this.listData = new Observable<ISelectableListData<IItem>>((observer) => {
            observer.next({
                items: allItems,
                disabledItems: allDisabledItems,
            } as ISelectableListData<IItem>);
        });

        this.listConfig = new SelectableItemListComponentConfiguration();
        this.listConfig.selectionMode = this.getSelectionModeAsEnum();
        this.listConfig.numItemsPerPage = Number.MAX_VALUE;
        this.listConfig.totalNumberOfItems = this.screen.items.length;

        if (this.screen.selectedItems) {
            this.selectedItems = this.screen.items
            .filter(item => this.screen.selectedItems.find(selectedItem => item.index === selectedItem.index));
        } else {
            this.selectedItems = new Array<IItem>();
        }

        this.determineAvailableActions();

        this.dialog.closeAll();
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.initialized = true;
    }

    ngAfterViewChecked() {
        if (this.items && this.size !== this.items.length) {
            this.size = this.items.length;
        }
    }

    getSelectionModeAsEnum(): SelectionMode {
        if (this.selectionMode) {
            return SelectionMode[this.selectionMode];
        } else {
            return SelectionMode.Single;
        }
    }

    onItemClick(itemInfo: ItemClickAction): void {
        this.doAction(this.itemActionName, itemInfo.item);
    }

    onItemSelected(itemInfo: ItemClickAction): void {
    }

    public onItemListChange(event: number[]): void {
        const indexes = event;
        this.selectedItems = this.screen.items.filter(element => {
            return indexes.includes(element.index);
        });

        if (this.individualMenuClicked) {
            this.individualMenuClicked = false;
        }
    }

    onActionButtonClick(): void {
        this.doAction(this.screen.actionButton.action, this.selectedItems);
    }

    isItemSelected(item: IItem): boolean {
        switch (this.listConfig.selectionMode) {
            case SelectionMode.Multiple:
                return this.selectedItems.includes(item);
            case SelectionMode.Single:
                return this.selectedItems[0] === item;
        }
    }

    isItemSelectedDisabled(): boolean {
        return this.getSelectionModeAsEnum() !== SelectionMode.Multiple;
    }

    isItemClickDisabled(): boolean {
        return this.itemActionName === null || this.getSelectionModeAsEnum() === SelectionMode.Multiple;
    }

    isAnyActionPresent(): boolean {
        return (this.addActionPresent || this.itemDisplayActionPresent || this.nextActionPresent);
    }

    isAddActionPresent(): boolean {
        //  NOTE: On the Non-Merch list screen, the add action is called 'Next'
        return (this.addActionPresent || this.nextActionPresent);
    }

    isItemDisplayActionPresent(): boolean {
        return this.itemDisplayActionPresent;
    }

    areAnyItemsSelected(): boolean {
        return (this.selectedItems.length > 0);
    }

    isSingleItemSelected(): boolean {
        return (this.selectedItems.length === 1);
    }

    areMultipleItemsSelected(): boolean {
        return (this.selectedItems.length > 1);
    }

    showItemDetailScreen(items: IItem[]) {
        this.doAction('ItemDisplay', items);
    }

    addItemsToSale(items: IItem[]) {
        //  Send the appropriate Add action to the page.
        const msg = (items.length === 1 ? 'Add the selected item to the transaction?'
            : 'Add the ' + items.length + ' selected items to the transaction?');
        
        // TODO: had to port this, not sure if it will work correctly
        const action: IActionItem = {
            action: this.getAddActionName(),
            confirmationDialog: {title: '', message: msg, cancelButtonName: 'No',
            confirmButtonName: 'Yes', cancelAction: null, confirmAction: null}
        };
        this.doAction(action, items);
    }

    openItemDialog(item: IItem) {
        this.individualMenuClicked = true;
        this.openItemsDialog([item]);
    }

    openItemsDialog(items: IItem[]): void {
        let options = [];

        if (items.length > 1) {
            //  NOTE: There are currently no available options for multiple selections.
            // optionItems = this.screen.multiSelectedMenuItems;
        } else {
            options = this.itemActions;
        }

        const dialogRef = this.dialog.open(NavListComponent, {
            viewContainerRef:  this.vcRef,
            width: '70%',
            data: {
                optionItems: options,
                payload: this.selectedItems,
                disableClose: false,
                autoFocus: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.log.info('The dialog was closed');
        });
    }

    doItemAction(item: IItem): void {
        this.doAction(this.itemActions[0], [item]);
    }

    public getIndexes(items: IItem[]): number[] {
        const indexes = [];
        items.forEach(item => indexes.push(item.index));
        return indexes;
    }

    scrollToBottom(): void {
        try {
            this.scrollList.nativeElement.scrollTop = this.scrollList.nativeElement.scrollHeight;
        } catch (err) { }
    }

    private getAddActionName(): string {
        if (this.addActionPresent) {
            //  Sell Item -> Inquiry scenario.
            return 'Add';
        } else if (this.nextActionPresent) {
            //  Sell Item -> Non-Marchandise scenario.
            return 'Next';
        }

        // If we made it here, there is no Add action for this scenario.
        return undefined;
    }

    private determineAvailableActions(): void {
        for (const menu of this.itemActions) {
            if (menu.action === 'ItemDisplay') {
                // this.log.info('### ItemDisplay action IS present');
                this.itemDisplayActionPresent = true;
            } else if (menu.action === 'Add') {
                // this.log.info('### Add action IS present');
                this.addActionPresent = true;
            } else if (menu.action === 'Next') {
                // this.log.info('### Next action IS present');
                this.nextActionPresent = true;
            }
        }
    }
}
