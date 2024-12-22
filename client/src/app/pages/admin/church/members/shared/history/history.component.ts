import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [],
})
export class HistoryComponent {
  @Input() history: any[] = [];

  constructor() {}

  ngOnInit() {}
}
