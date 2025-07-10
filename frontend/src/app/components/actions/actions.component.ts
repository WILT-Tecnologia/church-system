import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.scss',
  imports: [MatDividerModule],
})
export class ActionsComponent {
  @Input() enableDivider: boolean = true;
}
