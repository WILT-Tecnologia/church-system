import { Component, input } from '@angular/core';

@Component({
  selector: 'app-percentage-message',
  templateUrl: './percentage-message.component.html',
  styleUrl: './percentage-message.component.scss',
  imports: [],
})
export class PercentageMessageComponent {
  message = input.required<string>();
}
