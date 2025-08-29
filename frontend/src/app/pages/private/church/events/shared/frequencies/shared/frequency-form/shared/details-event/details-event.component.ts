import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';

import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventCall, Frequency } from 'app/model/Events';

import { FrequenciesService } from '../../../../frequencies.service';

interface Attendance {
  id: string;
  name: string;
  type: 'participants' | 'guests';
  present: boolean;
  frequencyId?: string;
}

@Component({
  selector: 'app-details-event',
  templateUrl: './details-event.component.html',
  styleUrl: './details-event.component.scss',
  imports: [
    MatCardModule,
    MatTableModule,
    MatSortModule,
    DatePipe,
    MatIconModule,
    MatDividerModule,
    CommonModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
})
export class DetailsEventComponent implements OnInit {
  eventCall = input<EventCall>();
  selectedEventCall: EventCall = {} as EventCall;
  isEditing = signal(false);
  participants = signal<Attendance[]>([]);
  membersDataSource = signal<MatTableDataSource<Attendance>>(new MatTableDataSource<Attendance>([]));
  guestsDataSource = signal<MatTableDataSource<Attendance>>(new MatTableDataSource<Attendance>([]));
  displayedColumns: string[] = ['start_datetime', 'end_datetime', 'theme', 'eventTypeName'];
  frequencyColumns: string[] = ['name', 'present'];

  private readonly frequencyService = inject(FrequenciesService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);

  ngOnInit() {
    if (this.eventCall()) {
      this.selectedEventCall = this.eventCall() as EventCall;
      this.loadFrequencies();
    }
  }

  async loadFrequencies() {
    if (!this.selectedEventCall.id || !this.selectedEventCall.event?.id) {
      return;
    }
    this.loading.show();
    try {
      const frequencies = await firstValueFrom(
        this.frequencyService.findAll(this.selectedEventCall.event.id, this.selectedEventCall.id),
      );
      const event = this.selectedEventCall.event;
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
      this.membersDataSource.set(new MatTableDataSource(this.participants().filter((p) => p.type === 'participants')));
      this.guestsDataSource.set(new MatTableDataSource(this.participants().filter((p) => p.type === 'guests')));
    } catch (error) {
      this.toast.openError(MESSAGES.LOADING_ERROR);
      console.error(error);
    } finally {
      this.loading.hide();
    }
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
  }

  async onPresenceChange(participant: Attendance, present: boolean) {
    if (!participant.id || !this.selectedEventCall.id || !this.selectedEventCall.event?.id) {
      console.warn('Invalid participant or event data');
      return;
    }
    this.participants.update((participants) =>
      participants.map((p) => (p.id === participant.id && p.type === participant.type ? { ...p, present } : p)),
    );
    this.membersDataSource.set(new MatTableDataSource(this.participants().filter((p) => p.type === 'participants')));
    this.guestsDataSource.set(new MatTableDataSource(this.participants().filter((p) => p.type === 'guests')));

    const payload: Partial<Frequency> = {
      event_call_id: this.selectedEventCall.id,
      present,
      ...(participant.type === 'participants' ? { member_id: participant.id } : { guest_id: participant.id }),
    };

    try {
      if (participant.frequencyId) {
        await firstValueFrom(
          this.frequencyService.update(
            this.selectedEventCall.event.id,
            this.selectedEventCall.id,
            participant.frequencyId,
            payload,
          ),
        );
        this.toast.openSuccess('Frequência atualizada com sucesso!');
      } else {
        const newFrequency = await firstValueFrom(
          this.frequencyService.create(this.selectedEventCall.event.id, this.selectedEventCall.id, payload),
        );
        this.participants.update((participants) =>
          participants.map((p) =>
            p.id === participant.id && p.type === participant.type ? { ...p, frequencyId: newFrequency.id } : p,
          ),
        );
        this.membersDataSource.set(
          new MatTableDataSource(this.participants().filter((p) => p.type === 'participants')),
        );
        this.guestsDataSource.set(new MatTableDataSource(this.participants().filter((p) => p.type === 'guests')));
        this.toast.openSuccess('Frequência criada com sucesso!');
      }
    } catch (error) {
      this.toast.openError('Erro ao atualizar frequência.');
      console.error(error);
    }
  }
}
