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
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events, Frequency } from 'app/model/Events';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../events.service';
import { CallToDayService } from '../call-to-day/call-to-day.service';
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
    CallToDayService,
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
  private readonly callToDayService = inject(CallToDayService);
  private readonly modal = inject(ModalService);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly data = inject<{ event: Events; call: CallToDay }>(MAT_DIALOG_DATA);

  event = signal<Events | null>(null);
  call = signal<CallToDay | null>(null);
  callToDays = signal<CallToDay[]>([]);

  dataSourceMat = new MatTableDataSource<Frequency>([]);

  originalFrequencies = signal<Frequency[]>([]);

  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'event_call.evento.church.name', header: 'Igreja', type: 'string' },
    { key: 'event_call.evento.name', header: 'Evento', type: 'string' },
    { key: 'event_call.evento.event_type.name', header: 'Tipo do evento', type: 'string' },
    { key: 'event_call.start_date', header: 'Data inicial', type: 'date' },
    { key: 'event_call.end_date', header: 'Data final', type: 'date' },
    { key: 'event_call.start_time', header: 'Hora inicial', type: 'hour' },
    { key: 'event_call.end_time', header: 'Hora final', type: 'hour' },
  ];

  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'check',
      label: 'Marcar Frequência',
      action: (frequency: any) => this.onMarkFrequency(frequency),
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    this.loading.show();
    try {
      const [event, callToDays] = await Promise.all([
        firstValueFrom(this.eventsService.findById(this.data.event.id)),
        firstValueFrom(this.callToDayService.findAll(this.data.event.id)),
      ]);

      this.event.set(event);
      this.callToDays.set(callToDays);

      const callId = this.data.call?.id ?? callToDays[0]?.id;
      if (!callId) {
        this.originalFrequencies.set([]);
        this.dataSourceMat.data = [];
        return;
      }

      const frequencies = await firstValueFrom(this.frequencyService.findAll(this.data.event.id, callId));
      this.originalFrequencies.set(frequencies);

      this.dataSourceMat.data = this.mapFrequencies(frequencies);
    } catch (e) {
      this.toast.openError('Erro ao carregar os dados');
      console.error(e);
    } finally {
      this.loading.hide();
    }
  }

  private mapFrequencies(frequencies: Frequency[]): any[] {
    const grouped: Record<string, Frequency[]> = {};
    frequencies.forEach((f) => {
      if (!f.event_call?.id) return;
      if (!grouped[f.event_call.id]) grouped[f.event_call.id] = [];
      grouped[f.event_call.id].push(f);
    });

    return Object.values(grouped).map((group) => {
      const freq = group[0];
      return {
        id: freq.event_call?.id ?? 'N/A',
        church: { name: freq.event_call?.event?.church ?? 'N/A' },
        event: {
          name: freq.event_call?.event?.name ?? 'N/A',
          event_type: freq.event_call?.event?.eventType ?? 'N/A',
        },
        start_date: freq.event_call?.start_date ?? 'N/A',
        end_date: freq.event_call?.end_date ?? 'N/A',
        start_time: freq.event_call?.start_time ?? 'N/A',
        end_time: freq.event_call?.end_time ?? 'N/A',
        isEditable: this.isStillEditable(freq.event_call?.start_date, freq.event_call?.start_time),
        participants: group,
      };
    });
  }

  private isStillEditable(date?: string, time?: string): boolean {
    if (!date || !time) return false;
    const freqDateTime = new Date(`${date}T${time}`);
    return freqDateTime.getTime() > Date.now();
  }

  async onAddFrequency() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      FrequencyFormComponent,
      'Marcar frequência',
      true,
      true,
      { event: this.data.event, call: this.data.call },
      '600px',
    );
    const result = await firstValueFrom(modal.afterClosed());
    if (result) {
      await this.loadData();
    }
  }

  async onMarkFrequency(frequencyRow: any) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      FrequencyFormComponent,
      'Editar frequência',
      true,
      true,
      { event: this.data.event, call: this.data.call, participants: frequencyRow.participants },
      '600px',
    );
    const result = await firstValueFrom(modal.afterClosed());
    if (result) {
      await this.loadData();
    }
  }
}
