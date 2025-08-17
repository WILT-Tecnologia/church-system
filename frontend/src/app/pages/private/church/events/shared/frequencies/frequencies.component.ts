import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';

import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCall, Events } from 'app/model/Events';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../events.service';
import { EventCallService } from '../event-call/event-call.service';
import { FrequenciesService } from './frequencies.service';
import { FrequencyFormComponent } from './shared/frequency-form/frequency-form.component';

@Component({
  selector: 'app-frequencies',
  templateUrl: './frequencies.component.html',
  styleUrl: './frequencies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent, NotFoundRegisterComponent],
  providers: [
    ToastService,
    LoadingService,
    ModalService,
    EventsService,
    FrequenciesService,
    EventCallService,
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
})
export class FrequenciesComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly eventsService = inject(EventsService);
  private readonly frequencyService = inject(FrequenciesService);
  private readonly callToDayService = inject(EventCallService);
  private readonly modal = inject(ModalService);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly data = inject<{ event: Events; call: EventCall }>(MAT_DIALOG_DATA);

  event = signal<Events | null>(null);
  callToDays = signal<EventCall[]>([]);

  dataSourceMat = new MatTableDataSource<EventCall>([]);

  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'event.name', header: 'Evento', type: 'string' },
    { key: 'start_date', header: 'Data inicial', type: 'date' },
    { key: 'end_date', header: 'Data final', type: 'date' },
    { key: 'start_time', header: 'Hora inicial', type: 'hour' },
    { key: 'end_time', header: 'Hora final', type: 'hour' },
    { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'location', header: 'Local', type: 'string' },
  ];

  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (row: EventCall) => this.onMarkFrequency(row),
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    try {
      const [event, callToDays] = await Promise.all([
        firstValueFrom(this.eventsService.findById(this.data.event.id)),
        firstValueFrom(this.callToDayService.findAll(this.data.event.id)),
      ]);

      this.event.set(event);
      this.callToDays.set(callToDays);
      this.dataSourceMat.data = callToDays;
    } catch (e) {
      this.toast.openError(MESSAGES.LOADING_ERROR);
      console.error(e);
    } finally {
      this.loading.hide();
    }
  }

  async onAddFrequency() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      FrequencyFormComponent,
      'Adicionar Frequência',
      true,
      true,
      { event: this.data.event, call: this.data.call },
      '',
      true,
    );
    const result = await firstValueFrom(modal.afterClosed());
    if (result) {
      await this.loadData();
    }
  }

  async onMarkFrequency(row: EventCall) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      FrequencyFormComponent,
      'Editar frequência',
      true,
      true,
      { event: this.data.event, call: row },
      '',
      true,
    );
    const result = await firstValueFrom(modal.afterClosed());
    if (result) {
      await this.loadData();
    }
  }
}
