import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { EventCall, Events, Frequency, ParticipantAndGuest } from '@app/model/Events';
import { EventsService } from '@app/pages/private/church/events/events.service';
import { EventCallService } from '@app/pages/private/church/events/shared/event-call/event-call.service';
import { FrequenciesService } from '@app/pages/private/church/events/shared/frequencies/frequencies.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { firstValueFrom, Observable } from 'rxjs';

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
    MatExpansionModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
})
export class FrequencyFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
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
  participantControl = new FormControl<string | ParticipantAndGuest | null>({
    value: null,
    disabled: false,
  });

  event = signal<Events | null>(null);
  eventCall = signal<EventCall[]>([]);
  frequencies = signal<Frequency[]>([]);
  participants = signal<Attendance[]>([]);
  availableParticipants = signal<ParticipantAndGuest[]>([]);

  members = computed(() => this.participants().filter((p) => p.type === 'participants'));
  guests = computed(() => this.participants().filter((p) => p.type === 'guests'));
  membersDataSource = signal<MatTableDataSource<Attendance>>(
    new MatTableDataSource<Attendance>([]),
  );
  guestsDataSource = signal<MatTableDataSource<Attendance>>(new MatTableDataSource<Attendance>([]));

  isPastDate = signal(false);
  detailsEvent = signal(true);
  participantsSignal = signal(true);
  displayedColumns = ['name', 'present'];
  searchTerm = signal<string>('');
  participantSearchTerm = signal<string>('');
  filterValue = signal<string>('');
  headerDateRange = signal<string>('');
  private savingIds = signal<Set<string>>(new Set());
  filteredEventCall = computed(() => {
    const now = new Date();
    const term = this.searchTerm().trim().toUpperCase();

    return this.eventCall().filter((ctd) => {
      const isFutureOrNow = ctd.status !== 'fechado';
      const matchesTerm = !term || this.displayEventCall(ctd).toLowerCase().includes(term);
      return isFutureOrNow && matchesTerm;
    });
  });

  filteredParticipants = computed(() => {
    const term = this.participantSearchTerm().toLowerCase();
    return this.availableParticipants().filter(
      (p) =>
        p.name.toLowerCase().includes(term) &&
        !this.participants().some((existing) => existing.id === p.id),
    );
  });

  membersAllSelected = computed(
    () => this.members().length > 0 && this.members().every((m) => m.present),
  );
  membersSomeSelected = computed(
    () => !this.membersAllSelected() && this.members().some((m) => m.present),
  );
  guestsAllSelected = computed(
    () => this.guests().length > 0 && this.guests().every((g) => g.present),
  );
  guestsSomeSelected = computed(
    () => !this.guestsAllSelected() && this.guests().some((g) => g.present),
  );

  constructor() {
    effect(() => {
      const mds = new MatTableDataSource(this.members());
      const gds = new MatTableDataSource(this.guests());

      const predicate = (data: Attendance, filter: string) =>
        !filter || data.name.toLowerCase().includes(filter.trim().toLowerCase());

      mds.filterPredicate = predicate;
      gds.filterPredicate = predicate;

      mds.filter = this.filterValue();
      gds.filter = this.filterValue();

      this.membersDataSource.set(mds);
      this.guestsDataSource.set(gds);

      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    if (!this.data.event?.id) {
      this.toastService.openError('Evento não ofertado.');
      this.dialogRef.close();
      return;
    }
    this.loadData();

    this.eventCallControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.searchTerm.set(value);
      } else if (value) {
        this.frequencyForm.get('event_call_id')?.setValue(value.id, { emitEvent: false });

        const isPast = value.status === 'fechado';
        this.isPastDate.set(isPast);

        if (isPast) {
          this.frequencyForm.disable({ emitEvent: false });
          this.eventCallControl.disable({ emitEvent: false });
        } else {
          this.frequencyForm.enable({ emitEvent: false });
          this.eventCallControl.enable({ emitEvent: false });
        }

        this.headerDateRange.set(this.humanizeDateRange(value));
      } else {
        this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
        this.isPastDate.set(false);
        this.frequencyForm.enable({ emitEvent: false });
        this.eventCallControl.enable({ emitEvent: false });
      }
      this.cdr.detectChanges();
    });

    this.participantControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') this.participantSearchTerm.set(value);
      this.cdr.detectChanges();
    });

    if (this.data.call) {
      this.eventCallControl.setValue(this.data.call, { emitEvent: false });
      this.frequencyForm.get('event_call_id')?.setValue(this.data.call.id, { emitEvent: false });

      const isPast = this.data.call.status === 'fechado';
      this.isPastDate.set(isPast);
      this.headerDateRange.set(this.humanizeDateRange(this.data.call));

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
    try {
      const [event, callToDays, frequencies] = await Promise.all([
        firstValueFrom(this.eventsService.findById(this.data.event.id)),
        firstValueFrom(this.callToDayService.getAllEventCalls(this.data.event.id)),
        this.data.call
          ? firstValueFrom(this.frequencyService.findAll(this.data.event.id, this.data.call.id))
          : [],
      ]);
      this.event.set(event);
      this.eventCall.set(callToDays);
      this.frequencies.set(frequencies || []);

      const participantsBase: Attendance[] = [
        ...(event.participants?.length ? event.participants : []).map((m) => {
          const frequency = frequencies.find((f) => f.member && f.member.id === m.id);
          return {
            id: m.id,
            name: m.person?.name || '--',
            type: 'participants' as const,
            present: frequency ? !!frequency.present : false,
            frequencyId: frequency?.id,
          };
        }),
        ...(event.guests?.length ? event.guests : []).map((g) => {
          const frequency = frequencies.find((f) => f.guest && f.guest.id === g.person_id);
          return {
            id: g.person_id || `guest-${Math.random().toString(36).substr(2, 9)}`,
            name: g.name || '--',
            type: 'guests' as const,
            present: frequency ? !!frequency.present : false,
            frequencyId: frequency?.id,
          };
        }),
      ].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

      this.participants.set(participantsBase);

      this.availableParticipants.set([
        ...(event.participants ?? []).map((m) => ({
          id: m.id,
          name: m.person?.name || '--',
          selected: false,
          isGuest: false,
        })),
        ...(event.guests ?? []).map((g) => ({
          id: g.person_id || `guest-${Math.random().toString(36).substr(2, 9)}`,
          name: g.name || '--',
          selected: false,
          isGuest: true,
        })),
      ]);

      if (!this.participants().length) {
        setTimeout(
          () =>
            this.toastService.openWarning(
              'Nenhum participante ou convidado encontrado para este evento.',
            ),
          0,
        );
      }
    } catch (error) {
      setTimeout(() => {
        this.toastService.openError(MESSAGES.LOADING_ERROR);
        this.dialogRef.close();
      }, 0);
    } finally {
      this.loadingService.hide();
      this.cdr.detectChanges();
    }
  }

  applyFilter(ev: Event) {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.filterValue.set(value);
    const mds = this.membersDataSource();
    const gds = this.guestsDataSource();
    mds.filter = value;
    gds.filter = value;
    this.cdr.detectChanges();
  }

  clearFilter() {
    this.filterValue.set('');
    const mds = this.membersDataSource();
    const gds = this.guestsDataSource();
    mds.filter = '';
    gds.filter = '';
    this.cdr.detectChanges();
  }

  toggleAllMembers(checked: boolean) {
    if (this.isPastDate()) return;
    this.members().forEach((m) => this.onPresenceChange(m, checked));
  }
  toggleAllGuests(checked: boolean) {
    if (this.isPastDate()) return;
    this.guests().forEach((g) => this.onPresenceChange(g, checked));
  }

  isSaving(p: Attendance) {
    return this.savingIds().has(`${p.type}_${p.id}`);
  }
  private setSaving(p: Attendance, saving: boolean) {
    const set = new Set(this.savingIds());
    const key = `${p.type}_${p.id}`;
    if (saving) {
      set.add(key);
    } else {
      set.delete(key);
    }
    this.savingIds.set(set);
  }

  async onPresenceChange(participant: Attendance, present: boolean) {
    this.participants.update((ps) =>
      ps.map((p) =>
        p.id === participant.id && p.type === participant.type ? { ...p, present } : p,
      ),
    );
    this.cdr.detectChanges();

    if (this.data.call) {
      const callId = this.data.call.id;
      if (!callId || !participant.id) {
        this.toastService.openError('Não foi possível atualizar a frequência. Dados incompletos.');
        return;
      }

      this.setSaving(participant, true);
      try {
        const payload: Partial<Frequency> = {
          event_call_id: callId,
          present: present,
          ...(participant.type === 'participants'
            ? { member_id: participant.id }
            : { guest_id: participant.id }),
        };

        let updatedFrequency: Frequency;
        if (participant.frequencyId) {
          updatedFrequency = await firstValueFrom(
            this.frequencyService.update(
              this.data.event.id,
              callId,
              participant.frequencyId,
              payload,
            ),
          );
        } else {
          updatedFrequency = await firstValueFrom(
            this.frequencyService.createFrequency(this.data.event.id, callId, payload),
          );
        }

        this.participants.update((ps) =>
          ps.map((p) =>
            p.id === participant.id && p.type === participant.type
              ? { ...p, present, frequencyId: updatedFrequency.id }
              : p,
          ),
        );
      } catch (error) {
        this.participants.update((ps) =>
          ps.map((p) =>
            p.id === participant.id && p.type === participant.type
              ? { ...p, present: !present }
              : p,
          ),
        );
        this.toastService.openError('Erro ao atualizar a frequência. Tente novamente.');
      } finally {
        this.setSaving(participant, false);
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
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

  private humanizeDateRange(call: EventCall) {
    const start = new Date(`${call.start_date}T${call.start_time}:00`);
    const end = new Date(`${call.end_date}T${call.end_time}:00`);
    const weekday = start.toLocaleDateString('pt-BR', { weekday: 'long' });
    const startDate = start.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const startTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${weekday}, ${startDate} — ${startTime} às ${endTime}`;
  }

  onClear() {
    this.frequencyForm.get('event_call_id')?.setValue('', { emitEvent: false });
    this.eventCallControl.setValue(null, { emitEvent: true });
    this.searchTerm.set('');
    this.cdr.detectChanges();
  }

  async save() {
    if (this.frequencyForm.invalid) {
      this.toastService.openError('Selecione uma chamada do dia');
      return;
    }
    const callId = this.frequencyForm.get('event_call_id')?.value;
    if (!callId || typeof callId !== 'string') {
      this.toastService.openError('Chamada do dia inválida');
      return;
    }
    if (!this.participants().length) {
      this.toastService.openError('Nenhum participante ou convidado encontrado');
      return;
    }
    const requests: Observable<Frequency>[] = [];
    for (const p of this.participants()) {
      if (!p.id) continue;
      const payload: Partial<Frequency> = {
        event_call_id: callId,
        present: p.present,
        ...(p.type === 'participants' ? { member_id: p.id } : { guest_id: p.id }),
      };
      if (p.frequencyId) {
        requests.push(
          this.frequencyService.update(this.data.event.id, callId, p.frequencyId, payload),
        );
      } else {
        requests.push(this.frequencyService.createFrequency(this.data.event.id, callId, payload));
      }
    }
    try {
      await Promise.all(
        requests.map((req) =>
          firstValueFrom(req).catch((error) => {
            this.toastService.openError(
              'Não foi possível salvar as frequência por algum motivo desconhecido, tente novamente mais tarde.',
            );
            throw error;
          }),
        ),
      );
      setTimeout(() => {
        this.toastService.openSuccess('Frequências salvas com sucesso!');
        this.dialogRef.close(true);
      }, 0);
    } catch (error: any) {
      setTimeout(() => {
        this.toastService.openError(
          'Não foi possível salvar as frequência por algum motivo desconhecido, tente novamente mais tarde.',
        );
      }, 0);
    } finally {
      this.loadingService.hide();
      this.cdr.detectChanges();
    }
  }
}
