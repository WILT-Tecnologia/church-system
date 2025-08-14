import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom, Observable } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events, Frequency, ParticipantAndGuest } from 'app/model/Events';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../../../events.service';
import { AddMembersGuestsComponent } from '../../../add-members-guests/add-members-guests.component';
import { CallToDayService } from '../../../call-to-day/call-to-day.service';
import { FrequenciesService } from '../../frequencies.service';

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
    AddMembersGuestsComponent,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    ToastService,
    LoadingService,
    EventsService,
    FrequenciesService,
    CallToDayService,
    ValidationService,
  ],
})
export class FrequencyFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly eventsService = inject(EventsService);
  private readonly frequencyService = inject(FrequenciesService);
  private readonly callToDayService = inject(CallToDayService);
  private readonly dialogRef = inject(MatDialogRef<FrequencyFormComponent>);
  private readonly data = inject<{ event: Events; call?: CallToDay; frequency?: Frequency }>(MAT_DIALOG_DATA);

  frequencyForm = this.fb.group({
    event_call_id: [{ value: '', disabled: false }, Validators.required],
  });
  callToDayControl = new FormControl<CallToDay | string | null>({ value: null, disabled: false });
  callToDays = signal<CallToDay[]>([]);
  event = signal<Events | null>(null);
  frequencies = signal<Frequency[]>([]);
  participants = signal<Attendance[]>([]);
  isPastDate = signal(false);
  detailsEvent = signal(true);
  participantsSignal = signal(false);
  searchTerm = signal<string>('');
  filteredCallToDays = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const name = this.searchTerm().toLowerCase();
    return this.callToDays().filter((ctd) => {
      const startDate = new Date(ctd.start_date);
      return startDate >= today && (!name || this.displayCallToDay(ctd).toLowerCase().includes(name));
    });
  });

  constructor() {
    this.loadData();
    this.callToDayControl.valueChanges.subscribe((value) => {
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
          this.callToDayControl.disable({ emitEvent: false });
        } else {
          this.frequencyForm.enable({ emitEvent: false });
          this.callToDayControl.enable({ emitEvent: false });
        }
      } else {
        this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
        this.isPastDate.set(false);
        this.frequencyForm.enable({ emitEvent: false });
        this.callToDayControl.enable({ emitEvent: false });
      }
    });
    if (this.data.call) {
      this.callToDayControl.setValue(this.data.call, { emitEvent: false });
      this.frequencyForm.get('event_call_id')?.setValue(this.data.call.id, { emitEvent: false });
    }
    if (this.data.frequency) {
      this.participants.update((participants) =>
        participants.map((p) =>
          p.id === this.data.frequency!.member_id || p.id === this.data.frequency!.guest_id
            ? { ...p, present: this.data.frequency!.present, frequencyId: this.data.frequency!.id }
            : p,
        ),
      );
    }

    if (this.data.frequency) {
      const frequency = this.data.frequency;
      let participant: Attendance | null = null;

      if (frequency.member) {
        participant = {
          id: frequency.member.id,
          name: frequency.member.person?.name || '--',
          type: 'participants',
          present: frequency.present,
          frequencyId: frequency.id,
        };
      } else if (frequency.guest) {
        participant = {
          id: frequency.guest.id,
          name: frequency.guest.name || '--',
          type: 'guests',
          present: frequency.present,
          frequencyId: frequency.id,
        };
      }

      if (participant) {
        this.participants.set([participant]);
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
      this.callToDays.set(callToDays);
      this.frequencies.set(frequencies);
      this.participants.set([
        ...(event.participants || []).map((m) => ({
          id: m.id,
          name: m.person?.name || '--',
          type: 'participants' as const,
          present: frequencies.find((f) => f.member_id === m.id)?.present || false,
          frequencyId: frequencies.find((f) => f.member_id === m.id)?.id,
        })),
        ...(event.guests || []).map((g) => ({
          id: g.id,
          name: g.name || '--',
          type: 'guests' as const,
          present: frequencies.find((f) => f.guest_id === g.id)?.present || false,
          frequencyId: frequencies.find((f) => f.guest_id === g.id)?.id,
        })),
      ]);
    } catch {
      this.toast.openError(MESSAGES.LOADING_ERROR);
      this.dialogRef.close();
    } finally {
      this.loading.hide();
    }
  }

  onSelectionChange(event: { participant: ParticipantAndGuest; present: boolean }) {
    this.participants.update((participants) => {
      const updated = participants.map((p) =>
        p.id === event.participant.id && p.type === (event.participant.isGuest ? 'guests' : 'participants')
          ? { ...p, present: event.present }
          : p,
      );
      return updated;
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.frequencyForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  onCallToDaySelected(event: MatAutocompleteSelectedEvent) {
    const selectedCallToDay = event.option.value as CallToDay;
    this.callToDayControl.setValue(selectedCallToDay, { emitEvent: true });
  }

  displayCallToDay(callToDay: CallToDay | null): string {
    if (!callToDay?.event) return '';
    const startDate = new Date(callToDay.start_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const endDate = new Date(callToDay.end_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const startTime = callToDay.start_time;
    const endTime = callToDay.end_time;
    return `${callToDay.event.name} | ${startDate} às ${startTime} até ${endDate} às ${endTime}`;
  }

  onClear() {
    this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
    this.callToDayControl.setValue(null, { emitEvent: true });
    this.searchTerm.set('');
  }

  closeDialog() {
    this.dialogRef.close();
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
      const payload: Partial<Frequency> = {
        event_call_id: callId,
        present: p.present,
        ...(p.type === 'participants' ? { member_id: p.id } : { guest_id: p.id }), // Garante que guest_id use o id correto
      };
      if (p.frequencyId) {
        requests.push(this.frequencyService.update(this.data.event.id, callId, p.frequencyId, payload));
      } else if (p.present || !p.frequencyId) {
        // Inclui requisições para criar ou atualizar mesmo se present for false
        requests.push(this.frequencyService.create(this.data.event.id, callId, payload));
      }
    }
    try {
      await Promise.all(
        requests.map((req) =>
          firstValueFrom(req).catch((error) => {
            console.error('API error:', error);
            throw error;
          }),
        ),
      );
      this.toast.openSuccess('Frequências salvas com sucesso');
      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Save error:', error);
      this.toast.openError('Erro ao salvar frequências: ' + (error?.message || 'Verifique o console'));
    } finally {
      this.loading.hide();
    }
  }
}
