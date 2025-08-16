import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { firstValueFrom, Observable } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCall, Events, Frequency, ParticipantAndGuest } from 'app/model/Events';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../../../events.service';
import { EventCallService } from '../../../event-call/event-call.service';
import { FrequenciesService } from '../../frequencies.service';
import { DetailsEventComponent } from './shared/details-event/details-event.component';

interface Attendance {
  id: string;
  name: string;
  type: 'participants' | 'guests';
  present: boolean;
  frequencyId?: string;
}

@Component({
  selector: 'app-frequency-form',
  templateUrl: './frequency-form.component.html',
  styleUrl: './frequency-form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    ColumnComponent,
    MatExpansionModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    DetailsEventComponent,
  ],
  providers: [
    ToastService,
    LoadingService,
    EventsService,
    FrequenciesService,
    EventCallService,
    ValidationService,
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
})
export class FrequencyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly eventsService = inject(EventsService);
  private readonly frequencyService = inject(FrequenciesService);
  private readonly callToDayService = inject(EventCallService);
  private readonly dialogRef = inject(MatDialogRef<FrequencyFormComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly data = inject<{
    event: Events;
    call?: EventCall;
    frequency?: Frequency;
    participants?: Frequency[];
  }>(MAT_DIALOG_DATA);

  frequencyForm = this.fb.group({
    event_call_id: [this.data.frequency?.event_call_id ?? '', Validators.required],
  });
  eventCallControl = new FormControl<EventCall | string | null>({ value: null, disabled: false });
  participantControl = new FormControl<string | ParticipantAndGuest | null>({ value: null, disabled: false });
  eventCall = signal<EventCall[]>([]);
  event = signal<Events | null>(null);
  frequencies = signal<Frequency[]>([]);
  participants = signal<Attendance[]>([]);
  availableParticipants = signal<ParticipantAndGuest[]>([]);
  members = computed(() => this.participants().filter((p) => p.type === 'participants'));
  guests = computed(() => this.participants().filter((p) => p.type === 'guests'));
  membersDataSource = signal<MatTableDataSource<Attendance>>(new MatTableDataSource<Attendance>([]));
  guestsDataSource = signal<MatTableDataSource<Attendance>>(new MatTableDataSource<Attendance>([]));
  isPastDate = signal(false);
  detailsEvent = signal(true);
  participantsSignal = signal(true);
  searchTerm = signal<string>('');
  participantSearchTerm = signal<string>('');
  displayedColumns = ['name', 'present'];
  filteredEventCall = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const name = this.searchTerm().toLowerCase();
    return this.eventCall().filter((ctd) => {
      const [year, month, day] = ctd.start_date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);

      return startDate >= today && (!name || this.displayEventCall(ctd).toLowerCase().includes(name));
    });
  });
  filteredParticipants = computed(() => {
    const term = this.participantSearchTerm().toLowerCase();
    return this.availableParticipants().filter(
      (p) => p.name.toLowerCase().includes(term) && !this.participants().some((existing) => existing.id === p.id),
    );
  });

  constructor() {
    effect(() => {
      this.membersDataSource.set(new MatTableDataSource(this.members()));
      this.guestsDataSource.set(new MatTableDataSource(this.guests()));
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    if (!this.data.event?.id) {
      this.toast.openError('Evento não fornecido.');
      this.dialogRef.close();
      return;
    }
    this.loadData();
    this.eventCallControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.searchTerm.set(value);
      } else if (value) {
        this.frequencyForm.get('event_call_id')?.setValue(value.id, { emitEvent: false });
        const startDate = new Date(value.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.isPastDate.set(startDate < today);
        if (this.isPastDate()) {
          this.frequencyForm.disable({ emitEvent: false });
          this.eventCallControl.disable({ emitEvent: false });
        } else {
          this.frequencyForm.enable({ emitEvent: false });
          this.eventCallControl.enable({ emitEvent: false });
        }
      } else {
        this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
        this.isPastDate.set(false);
        this.frequencyForm.enable({ emitEvent: false });
        this.eventCallControl.enable({ emitEvent: false });
      }
      this.cdr.detectChanges();
    });
    this.participantControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.participantSearchTerm.set(value);
      }
      this.cdr.detectChanges();
    });
    if (this.data.call) {
      this.eventCallControl.setValue(this.data.call, { emitEvent: false });
      this.frequencyForm.get('event_call_id')?.setValue(this.data.call.id, { emitEvent: false });

      const call = this.data.call;
      const [endYear, endMonth, endDay] = call.end_date.split('-').map(Number);
      const [endHour, endMinute] = call.end_time.split(':').map(Number);

      const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);
      const now = new Date();

      const isPast = endDateTime < now;
      this.isPastDate.set(isPast);

      if (isPast) {
        this.frequencyForm.disable({ emitEvent: false });
        this.eventCallControl.disable({ emitEvent: false });
      } else {
        this.frequencyForm.enable({ emitEvent: false });
        this.eventCallControl.enable({ emitEvent: false });
      }
    }
  }

  private async loadData() {
    this.loading.show();
    try {
      const [event, callToDays, frequencies] = await Promise.all([
        firstValueFrom(this.eventsService.findById(this.data.event.id)),
        firstValueFrom(this.callToDayService.findAll(this.data.event.id)),
        this.data.call ? firstValueFrom(this.frequencyService.findAll(this.data.event.id, this.data.call.id)) : [],
      ]);
      this.event.set(event);
      this.eventCall.set(callToDays);
      this.frequencies.set(frequencies);

      // Load available participants and guests for autocomplete
      this.availableParticipants.set([
        ...(event.participants?.length ? event.participants : []).map((m) => ({
          id: m.id,
          name: m.person?.name || '--',
          selected: false,
          isGuest: false,
        })),
        ...(event.guests?.length ? event.guests : []).map((g) => ({
          id: g.person_id || `guest-${Math.random().toString(36).substr(2, 9)}`,
          name: g.name || '--',
          selected: false,
          isGuest: true,
        })),
      ]);

      this.participants.set([
        ...(event.participants?.length ? event.participants : []).map((m) => {
          const frequency = frequencies.find((f) => f.member_id === m.id);
          return {
            id: m.id,
            name: m.person?.name || '--',
            type: 'participants' as const,
            present: frequency ? !!frequency.present : false,
            frequencyId: frequency?.id,
          };
        }),
        ...(event.guests?.length ? event.guests : []).map((g) => {
          const frequency = frequencies.find((f) => f.guest?.id === g.person_id);
          return {
            id: g.person_id || `guest-${Math.random().toString(36).substr(2, 9)}`,
            name: g.name || '--',
            type: 'guests' as const,
            present: frequency ? !!frequency.present : false,
            frequencyId: frequency?.id,
          };
        }),
      ]);

      if (!this.participants().length) {
        setTimeout(() => {
          this.toast.openWarning('Nenhum participante ou convidado encontrado para este evento.');
        }, 0);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      setTimeout(() => {
        this.toast.openError(MESSAGES.LOADING_ERROR);
        this.dialogRef.close();
      }, 0);
    } finally {
      this.loading.hide();
      this.cdr.detectChanges();
    }
  }

  async onPresenceChange(participant: Attendance, present: boolean) {
    // Atualiza o estado local imediatamente, independentemente do modo
    this.participants.update((participants) =>
      participants.map((p) => (p.id === participant.id && p.type === participant.type ? { ...p, present } : p)),
    );
    this.cdr.detectChanges(); // Garante a atualização da view

    // Se estiver no modo de EDIÇÃO (data.call existe), salva no banco
    if (this.data.call) {
      const callId = this.data.call.id;
      if (!callId || !participant.id) {
        console.warn('Event Call ID or Participant ID is missing. Cannot update frequency.');
        this.toast.openError('Não foi possível atualizar a frequência. Dados incompletos.');
        return;
      }
      this.loading.show();
      try {
        const payload: Partial<Frequency> = {
          event_call_id: callId,
          present: present,
          ...(participant.type === 'participants' ? { member_id: participant.id } : { guest_id: participant.id }),
        };

        // Usa o ID de frequência se existir, para atualizar. Senão, cria.
        let updatedFrequency: Frequency;
        if (participant.frequencyId) {
          updatedFrequency = await firstValueFrom(
            this.frequencyService.update(this.data.event.id, callId, participant.frequencyId, payload),
          );
        } else {
          updatedFrequency = await firstValueFrom(this.frequencyService.create(this.data.event.id, callId, payload));
        }

        // Atualiza a lista local com o novo ID de frequência para futuras atualizações
        this.participants.update((participants) =>
          participants.map((p) => {
            if (p.id === participant.id && p.type === participant.type) {
              return { ...p, present, frequencyId: updatedFrequency.id };
            }
            return p;
          }),
        );
        this.toast.openSuccess('Frequência atualizada com sucesso!');
      } catch (error) {
        console.error('Error updating frequency:', error);
        // Em caso de erro, reverte a alteração visual na UI
        this.participants.update((participants) =>
          participants.map((p) => {
            if (p.id === participant.id && p.type === participant.type) {
              return { ...p, present: !present };
            }
            return p;
          }),
        );
        this.toast.openError('Erro ao atualizar a frequência. Tente novamente.');
      } finally {
        this.loading.hide();
        this.cdr.detectChanges();
      }
    }
    // No modo de criação, a alteração de estado já foi feita no início da função.
    // O salvamento real ocorre apenas no método `save()`.
  }

  private onParticipantSelected(event: MatAutocompleteSelectedEvent) {
    const selectedParticipant = event.option.value as ParticipantAndGuest;
    if (!this.participants().some((p) => p.id === selectedParticipant.id)) {
      this.participants.update((participants) => [
        ...participants,
        {
          id: selectedParticipant.id,
          name: selectedParticipant.name,
          type: selectedParticipant.isGuest ? ('guests' as const) : ('participants' as const),
          present: false,
        },
      ]);
      this.participantControl.setValue(null, { emitEvent: true });
      this.participantSearchTerm.set('');
      this.cdr.detectChanges();
    }
  }

  displayParticipant(participant: ParticipantAndGuest | null): string {
    return participant ? participant.name : '';
  }

  getErrorMessage(controlName: string) {
    const control = this.frequencyForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  onEventCallSelected(event: MatAutocompleteSelectedEvent) {
    const selectedCallToDay = event.option.value as EventCall;
    this.eventCallControl.setValue(selectedCallToDay, { emitEvent: true });
    this.cdr.detectChanges();
  }

  // ... dentro da sua classe FrequencyFormComponent
  displayEventCall(callToDay: EventCall | null): string {
    if (!callToDay?.event) return '';
    const [startYear, startMonth, startDay] = callToDay.start_date.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);

    const [endYear, endMonth, endDay] = callToDay.end_date.split('-').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    const formattedStartDate = startDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedEndDate = endDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const startTime = callToDay.start_time;
    const endTime = callToDay.end_time;

    return `${callToDay.event.name} | ${formattedStartDate} às ${startTime} até ${formattedEndDate} às ${endTime}`;
  }

  onClear() {
    this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
    this.eventCallControl.setValue(null, { emitEvent: true });
    this.searchTerm.set('');
    this.cdr.detectChanges();
  }

  closeDialog() {
    this.dialogRef.close();
    this.cdr.detectChanges();
  }

  async save() {
    if (this.frequencyForm.invalid) {
      this.toast.openError('Selecione uma chamada do dia');
      return;
    }
    const callId = this.frequencyForm.get('event_call_id')?.value;
    if (!callId || typeof callId !== 'string') {
      this.toast.openError('Chamada do dia inválida');
      return;
    }
    if (!this.participants().length) {
      this.toast.openError('Nenhum participante ou convidado encontrado');
      return;
    }
    this.loading.show();
    const requests: Observable<Frequency>[] = [];
    for (const p of this.participants()) {
      if (!p.id) {
        console.warn(`Skipping save for ${p.type} with undefined id`);
        continue;
      }
      const payload: Partial<Frequency> = {
        event_call_id: callId,
        present: p.present,
        ...(p.type === 'participants' ? { member_id: p.id } : { guest_id: p.id }),
      };
      if (p.frequencyId) {
        requests.push(this.frequencyService.update(this.data.event.id, callId, p.frequencyId, payload));
      } else {
        requests.push(this.frequencyService.create(this.data.event.id, callId, payload));
      }
    }
    try {
      await Promise.all(
        requests.map((req) =>
          firstValueFrom(req).catch((error) => {
            this.toast.openError(
              'Não foi possível salvar as frequência por algum motivo desconhecido, tente novamente mais tarde.',
            );
            throw error;
          }),
        ),
      );
      setTimeout(() => {
        this.toast.openSuccess('Frequências salvas com sucesso!');
        this.dialogRef.close(true);
      }, 0);
    } catch (error: any) {
      setTimeout(() => {
        this.toast.openError(
          'Não foi possível salvar as frequência por algum motivo desconhecido, tente novamente mais tarde.',
        );
      }, 0);
      console.error('Server error');
    } finally {
      this.loading.hide();
      this.cdr.detectChanges();
    }
  }
}
