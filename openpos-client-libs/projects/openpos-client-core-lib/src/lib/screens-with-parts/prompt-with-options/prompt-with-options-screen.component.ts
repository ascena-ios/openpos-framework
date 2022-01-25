
import { Component, ViewChild } from '@angular/core';
import { ScreenComponent } from '../../shared/decorators/screen-component.decorator';
import { IOptionItem } from '../../core/interfaces/option-item.interface';
import { PromptWithOptionsInterface } from './prompt-with-options.interface';
import { PosScreenDirective } from '../pos-screen/pos-screen.component';
import { PromptFormPartComponent } from '../../shared/screen-parts/prompt-form-part/prompt-form-part.component';


@ScreenComponent({
    name: 'PromptWithOptions'
})
@Component({
    selector: 'app-prompt-with-options-screen',
    templateUrl: './prompt-with-options-screen.component.html',
    styleUrls: ['./prompt-with-options-screen.component.scss']
})
export class PromptWithOptionsScreenComponent extends PosScreenDirective<PromptWithOptionsInterface> {

    @ViewChild(PromptFormPartComponent, { static: true }) private promptForm: PromptFormPartComponent;
    public optionItems: IOptionItem[];

    buildScreen() {
        this.optionItems = this.screen.options;
    }

    onOptionSelected(action: string) {
        if (this.promptForm.promptFormGroup.valid) {
            this.doAction(action, this.promptForm.promptFormGroup.value[this.promptForm.inputControlName]);
        }
    }

    getOptionClasses(option: IOptionItem) {
        let classString = 'pull-right line-item-caret sm';
        if (!option.enabled) {
            classString = classString + ' muted-color';
        }
        return classString;
    }
}
