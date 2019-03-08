import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})
export class IconButtonComponent {

    @Input() disabled = false;
    @Input() iconName: string;
    @Input() color: string;

    @Output() buttonClick = new EventEmitter();
}
