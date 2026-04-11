import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TabCrudComponent } from '@app/components/tab-crud/tab-crud.component';
import { CrudConfig, TabConfig } from '@app/components/tab-crud/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-list',
  template: `
    @if (tabs().length > 0) {
      <app-tab-crud
        [tabs]="tabs()"
        [crudConfig]="crudConfig()"
        [dataService]="dataService()"
        (add)="add.emit($event)"
        [ctaLabel]="'Novo Evento'"
      ></app-tab-crud>
    }
  `,
  styles: [],
  imports: [CommonModule, TabCrudComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventListComponent {
  tabs = input<TabConfig[]>([]);
  crudConfig = input.required<CrudConfig>();
  dataService = input.required<(tabId: string) => Observable<any[]>>();
  add = output<string>();
}
