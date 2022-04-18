import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActionService } from '../../core/actions/action.service';
import { IActionItem } from '../../core/actions/action-item.interface';
import { By } from '@angular/platform-browser';
import { SelectionListInterface } from '../selection-list/selection-list.interface';
import { CLIENTCONTEXT } from '../../core/client-context/client-context-provider.interface';
import { TimeZoneContext } from '../../core/client-context/time-zone-context';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SelectableItemListComponentConfiguration } from '../../shared/components/selectable-item-list/selectable-item-list.component';
import { SelectionListScreenComponent } from './selection-list-screen.component';
import { ISelectionListItem } from './selection-list-item.interface';
import { SelectionMode } from '../../core/interfaces/selection-mode.enum';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';
import { ICustomerDetails } from '../customer-search-result-dialog/customer-search-result-dialog.interface';
import { KeybindingZoneService } from '../../core/keybindings/keybinding-zone.service';

class MockActionService {
    doAction(action: IActionItem) { }
}
class MockMatDialog { }
class ClientContext { }

describe('SelectionListScreenComponent', () => {
    let component: SelectionListScreenComponent;
    let fixture: ComponentFixture<SelectionListScreenComponent>;
    let testAddress;
    let testCustomer;
    let testCustomerDisabled;
    let threeResults;

    describe('non mobile', () => {
        beforeEach(() => {
            testAddress = { line1: 'testStreet', line2: 'testStreetLine2', city: 'testCity', state: 'testState', postalCode: '12345' };
            testCustomer = { enabled: true, selected: false } as ISelectionListItem;
            testCustomerDisabled = { ...testCustomer } as ISelectionListItem;
            testCustomerDisabled.enabled = false;
            threeResults = [testCustomer, testCustomer, testCustomerDisabled];

            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                declarations: [
                    SelectionListScreenComponent,
                    ImageUrlPipe
                ],
                providers: [
                    KeybindingZoneService,
                    { provide: ActionService, useClass: MockActionService },
                    { provide: MatDialog, useClass: MockMatDialog },
                    { provide: ClientContext, useValue: {} },
                    { provide: CLIENTCONTEXT, useClass: TimeZoneContext }
                ],
                schemas: [
                    NO_ERRORS_SCHEMA,
                ]
            }).compileComponents();
            fixture = TestBed.createComponent(SelectionListScreenComponent);
            component = fixture.componentInstance;
            component.screen = {
                nonSelectionButtons: [{ title: 'NonSelectable' }],
                selectionButtons: [{ title: 'Select' }, { title: 'View' }]
            } as SelectionListInterface<ISelectionListItem>;
            fixture.detectChanges();
        });

        it('renders', () => {
            expect(component).toBeDefined();
        });

        describe('component', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(SelectionListScreenComponent);
                component = fixture.componentInstance;
                component.screen = { nonSelectionButtons: [{ title: 'NonSelectable' }], selectionButtons: [{ title: 'Select' }, { title: 'View' }] } as SelectionListInterface<ISelectionListItem>;
                fixture.detectChanges();
            });
            it('transform response results to item maps', (done) => {
                component.screen.selectionList = threeResults;
                component.buildScreen();
                component.listData.subscribe(
                    result => {
                        expect(result.items).toBeTruthy();
                        expect(result.disabledItems).toBeTruthy();
                        expect(result.items.size).toBe(3);
                        expect(result.disabledItems.size).toBe(1);
                        expect(result.items.get(0)).toBe(testCustomer);
                        expect(result.disabledItems.get(2)).toBe(testCustomerDisabled);
                        done();
                    },
                    () => { fail(); done(); },
                    () => { fail(); done(); }
                );
            });

            describe('selection mode functionality', () => {
                let selectedCustomer;
                let listIn;
                beforeEach(() => {
                    selectedCustomer = { ...testCustomer } as ICustomerDetails;
                    selectedCustomer.selected = true;
                    listIn = [testCustomer, selectedCustomer];
                });
                it('should not populate selectedItems if multiSelect not specified', () => {
                    component.screen.selectionList = threeResults;
                    component.screen.fetchDataAction = 'Something';
                    component.buildScreen();
                    expect(component.selectedItems).toBeUndefined();
                });
                it('should put selected customers in to selectedItems if multiSelect', () => {
                    component.screen.selectionList = listIn;
                    component.screen.fetchDataAction = undefined;
                    component.screen.multiSelect = true;
                    component.buildScreen();
                    expect(component.selectedItems[0]).toBe(selectedCustomer);
                    expect(component.indexes.length).toBe(1);
                });

                it('should put selected customers in to selectedItem if not multiSelect', () => {
                    component.screen.selectionList = listIn;
                    component.screen.fetchDataAction = undefined;
                    component.screen.multiSelect = false;
                    component.buildScreen();
                    expect(component.selectedItem).toBe(selectedCustomer);
                    expect(component.index).not.toBe(-1);
                });
            });
            it('define selection list configuration with 0 items per page', () => {
                component.screen.numberItemsPerPage = 0;
                component.screen.selectionList = [];
                component.screen.multiSelect = false;
                component.buildScreen();
                expect(component.listConfig instanceof SelectableItemListComponentConfiguration).toBeTruthy();
                expect(component.listConfig.numItemsPerPage).toBe(Number.MAX_VALUE);
                expect(component.listConfig.totalNumberOfItems).toBe(component.screen.numberTotalItems);
                expect(component.listConfig.defaultSelectItemIndex).toBe(component.screen.defaultSelectItemIndex);
                expect(component.listConfig.selectionMode).toBe(SelectionMode.Single);
                expect(component.listConfig.fetchDataAction).toBe(component.screen.fetchDataAction);
            });
            it('define selection list configuration with 1000 items per page ', () => {
                component.screen.numberItemsPerPage = 1000;
                component.screen.selectionList = threeResults;
                component.screen.multiSelect = true;
                component.buildScreen();
                expect(component.listConfig instanceof SelectableItemListComponentConfiguration).toBeTruthy();
                expect(component.listConfig.numItemsPerPage).toBe(component.screen.numberItemsPerPage);
                expect(component.listConfig.totalNumberOfItems).toBe(component.screen.selectionList.length);
                expect(component.listConfig.defaultSelectItemIndex).toBe(component.screen.defaultSelectItemIndex);
                expect(component.listConfig.selectionMode).toBe(SelectionMode.Multiple);
                expect(component.listConfig.fetchDataAction).toBe(component.screen.fetchDataAction);
            });
            it('onItemChange should set index', () => {
                component.onItemChange(5);
                expect(component.index).toBe(5);
            });
            it('doSelectionButtonAction should pass on action ', () => {
                spyOn(component, 'doAction');
                component.index = 1;
                component.doSelectionButtonAction({} as IActionItem);
                expect(component.doAction).toHaveBeenCalledWith({} as IActionItem, 1);
            });
        });

        describe('template', () => {
            it('nonSelectable buttons will render and have actions', () => {
                const secondaryButton = fixture.debugElement.queryAll(By.css('app-secondary-button'));
                expect(secondaryButton[0].nativeElement.textContent).toBeDefined();
                spyOn(component, 'doNonSelectionButtonAction');
                secondaryButton[0].nativeElement.click();
                expect(component.doNonSelectionButtonAction).toHaveBeenCalled();
            });
            it('secondary-buttons do render and have actions', () => {
                const secondaryButton = fixture.debugElement.queryAll(By.css('app-secondary-button'));
                expect(secondaryButton[1].nativeElement.textContent).toBeDefined();
                spyOn(component, 'doSelectionButtonAction');
                secondaryButton[1].nativeElement.click();
                expect(component.doSelectionButtonAction).toHaveBeenCalled();
            });

            it('primary-button do render and have actions', () => {
                const primaryButton = fixture.debugElement.query(By.css('app-primary-button'));
                expect(primaryButton.nativeElement.textContent).toBeDefined();
                spyOn(component, 'doSelectionButtonAction');
                primaryButton.nativeElement.click();
                expect(component.doSelectionButtonAction).toHaveBeenCalled();
            });
        });
    });
});
