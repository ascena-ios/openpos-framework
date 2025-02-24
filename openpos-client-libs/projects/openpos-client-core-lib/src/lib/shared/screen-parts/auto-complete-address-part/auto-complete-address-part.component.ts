import { ViewChildren, Input, ViewChild, Component, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ScreenPartComponent } from '../screen-part';
import { ScreenPart } from '../../decorators/screen-part.decorator';
import { FormBuilder } from '../../../core/services/form-builder.service';
import { DynamicFormFieldComponent } from '../../components/dynamic-form-field/dynamic-form-field.component';
import { ShowErrorsComponent } from '../../components/show-errors/show-errors.component';
import { IForm } from '../../../core/interfaces/form.interface';
import { IFormElement } from '../../../core/interfaces/form-field.interface';
import { IActionItem } from '../../../core/actions/action-item.interface';
import type { QueryList } from '@angular/core';
import { GoogleAddress } from '../../directives/auto-complete-address.directive';

@ScreenPart({
    name: 'AutoCompleteAddressPart'
})
@Component({
    selector: 'app-auto-complete-address-part',
    templateUrl: './auto-complete-address-part.component.html',
    styleUrls: ['./auto-complete-address-part.component.scss']
})
export class AutoCompleteAddressPartComponent extends ScreenPartComponent<IForm> {

    @ViewChildren(DynamicFormFieldComponent) children: QueryList<DynamicFormFieldComponent>;
    @ViewChild('formErrors') formErrors: ShowErrorsComponent;
    form: FormGroup;

    streetAddress: IFormElement;
    addressLine2: IFormElement;
    locality: IFormElement;
    state: IFormElement;
    postalCode: IFormElement;
    country: IFormElement;

    nonAddressFields: IFormElement[];

    buttons: IFormElement[];

    private _alternateSubmitActions: string[];

    @Input() set formName(name: string) {
        this.screenPartName = name;
    }

    @Input() submitButton: IActionItem;

    constructor(private formBuilder: FormBuilder, injector: Injector) {
        super(injector);
    }

    setAddress(address: GoogleAddress) {
        if (address.streetNumber) {
            this.form.get('streetAddress').setValue(address.streetNumber + ' ' + address.streetName);
        } else {
            this.form.get('streetAddress').setValue(address.streetName);
        }
        this.form.get('locality').setValue(address.locality);
        this.form.get('state').setValue(address.state);
        this.form.get('postalCode').setValue(address.postalCode);
        this.form.get('country').setValue(address.country);
        this.onFieldChanged(this.country);
    }

    screenDataUpdated() {
        this.buttons = new Array<IFormElement>();
        this.nonAddressFields = new Array<IFormElement>();

        this.form = this.formBuilder.group(this.screenData);

        if (this.screenData && this.screenData.formElements) {
            this.screenData.formElements.forEach(element => {
                if (element.elementType === 'Button') {
                    this.buttons.push(element);
                }

                const isAddressField = this.parseAddressField(element);
                if (!isAddressField) {
                    this.nonAddressFields.push(element);
                }
            });
        }
    }

    private parseAddressField(element: IFormElement): boolean {
        let isAddressField = false;
        if (element.id === 'streetAddress') {
            this.streetAddress = element;
        } else if (element.id === 'addressLine2') {
            this.addressLine2 = element;
            isAddressField = true;
        } else if (element.id === 'locality') {
            this.locality = element;
            isAddressField = true;
        } else if (element.id === 'state') {
            this.state = element;
            isAddressField = true;
        } else if (element.id === 'postalCode') {
            this.postalCode = element;
            isAddressField = true;
        } else if (element.id === 'country') {
            this.country = element;
            isAddressField = true;
        }
        return isAddressField;
    }

    @Input()
    get alternateSubmitActions(): string[] {
        return this._alternateSubmitActions;
    }

    set alternateSubmitActions(actions: string[]) {
        this._alternateSubmitActions = actions;
        if (actions) {
            actions.forEach(action => {

                this.actionService.registerActionPayload(action, () => {
                    if (this.form.valid) {
                        this.formBuilder.buildFormPayload(this.form, this.screenData);
                        return this.screenData;
                    } else {
                        // Show errors for each of the fields where necessary
                        Object.keys(this.form.controls).forEach(f => {
                            const control = this.form.get(f);
                            control.markAsTouched({ onlySelf: true });
                        });
                        throw Error('form is invalid');
                    }
                });
            });
        }
    }

    submitForm() {
        this.formBuilder.buildFormPayload(this.form, this.screenData);
        this.doAction(this.submitButton, this.screenData);
    }

    onFieldChanged(formElement: IFormElement) {
        if (formElement.valueChangedAction) {
            this.formBuilder.buildFormPayload(this.form, this.screenData);
            this.doAction(formElement.valueChangedAction, this.screenData);
        }
    }

    onButtonClick(formElement: IFormElement) {
        this.doAction({ action: formElement.action, confirmationDialog: formElement.confirmationDialog }, null);
    }
}
