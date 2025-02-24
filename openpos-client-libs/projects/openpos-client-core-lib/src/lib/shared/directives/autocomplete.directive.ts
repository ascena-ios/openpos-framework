import { Directive, ElementRef } from '@angular/core';
import { CONFIGURATION } from '../../configuration/configuration';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'input:not([type=checkbox]), textarea, form, mat-form-field'
})
export class AutocompleteDirective {

    constructor(public elementRef: ElementRef) {
        if (!CONFIGURATION.enableAutocomplete) {
            if (elementRef.nativeElement.getAttribute('type') === 'password') {
                elementRef.nativeElement.setAttribute('autocomplete', 'new-password');
            } else {
                elementRef.nativeElement.setAttribute('autocomplete', 'off');
            }
        }
    }
}
