import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { EventCall, Events } from '@app/model/Events';
import { FormServiceService } from '@app/services/form-service.service';
import { EventCallService } from '../event-call/event-call.service';
import { FrequencyFormComponent } from './shared/frequency-form/frequency-form.component';

@Component({
  selector: 'app-frequencies',
  templateUrl: './frequencies.component.html',
  styleUrl: './frequencies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent],
})
export class FrequenciesComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly callToDayService = inject(EventCallService);
  private readonly formService = inject(FormServiceService);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly data: { event: Events; call: EventCall } = inject(MAT_DIALOG_DATA);
  public readonly writePermission = signal<string>('write_church_eventos');
  public readonly readPermission = signal<string>('read_church_eventos');

  event = signal<Events[]>([]);
  callToDays = signal<EventCall[]>([]);
  dataSourceMat = new MatTableDataSource<EventCall>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'event.name', header: 'Evento', type: 'string' },
    { key: 'start_date', header: 'Data inicial', type: 'date' },
    { key: 'end_date', header: 'Data final', type: 'date' },
    { key: 'start_time', header: 'Hora inicial', type: 'time' },
    { key: 'end_time', header: 'Hora final', type: 'time' },
    { key: 'theme', header: 'Tema', type: 'string' },
    { key: 'status', header: 'Status', type: 'eventStatus' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (row: EventCall) => this.onMarkFrequency(row),
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.callToDayService.getAllEventCalls(this.data.event.id).subscribe({
      next: (callToDays) => {
        this.callToDays.set(callToDays);
        this.dataSourceMat.data = callToDays;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onAddFrequency() {
    this.formService.openFormModal(
      `Adicionando nova frequência para o evento ${this.data.event.name}`,
      FrequencyFormComponent,
      { event: this.data.event, call: this.data.call },
      ['cancel'],
    );
  }

  onMarkFrequency(eventCall: EventCall) {
    this.formService.openFormModal(
      `Editando frequência do evento ${this.data.event.name}`,
      FrequencyFormComponent,
      { event: this.data.event, call: eventCall },
      ['cancel'],
      true,
    );
  }
}
