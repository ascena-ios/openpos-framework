import { TenderScreenInterface } from './tender.interface';
import { Component } from '@angular/core';
import { ScreenComponent } from '../../shared/decorators/screen-component.decorator';
import { PosScreenDirective } from '../pos-screen/pos-screen.component';

@ScreenComponent({
    name: 'Tender'
})
@Component({
    selector: 'app-tender',
    templateUrl: './tender.component.html',
    styleUrls: ['./tender.component.scss']
})
export class TenderComponent extends PosScreenDirective<TenderScreenInterface> {

    buildScreen() {
    }

}
