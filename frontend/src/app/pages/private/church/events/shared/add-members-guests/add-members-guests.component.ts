import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ChipComponent } from 'app/components/chip/chip.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { PaginatorComponent } from 'app/components/paginator/paginator.component';
import { SearchComponent } from 'app/components/search/search.component';
import { ToastService } from 'app/components/toast/toast.service';
import { EventData, Events } from 'app/model/Events';

import { MembersService } from '../../../members/members.service';
import { EventsService } from '../../events.service';
import { GuestsService } from '../guests/guests.service';
import { ParticipantsService } from './service/participants.service';
import { DetailsEventComponent } from './shared/details-event/details-event.component';

interface ParticipantAndGuest {
  id: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-add-members-guests',
  templateUrl: './add-members-guests.component.html',
  styleUrls: ['./add-members-guests.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
    MatDividerModule,
    MatPaginatorModule,
    DetailsEventComponent,
    SearchComponent,
    ChipComponent,
    ColumnComponent,
    PaginatorComponent,
    ActionsComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class AddMembersGuestsComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private membersService: MembersService,
    private guestsService: GuestsService,
    private eventsService: EventsService,
    private toast: ToastService,
    private loading: LoadingService,
    private participantsService: ParticipantsService,
    private dialogRef: MatDialogRef<AddMembersGuestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {
    this.participantAndGuestForm = this.createForm();
  }

  EventData: EventData = {
    name: 'Acampamento da mocidade',
    date: '2025-02-25',
    time: '19:00 - 21:00',
    theme: 'Videira verdadeira',
    type: 'Acampamento',
    observations: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste at vel provident ullam cupiditate, rerum culpa tempore laboriosam neque ipsa voluptates deserunt nihil dolorum! Ducimus aspernatur doloremque quasi aliquam eius?`,
  };
  participantAndGuestForm: FormGroup;
  members: ParticipantAndGuest[] = [];
  guests: ParticipantAndGuest[] = [];
  filteredMembers: ParticipantAndGuest[] = [];
  filteredGuests: ParticipantAndGuest[] = [];
  paginatedMembers: ParticipantAndGuest[] = [];
  paginatedGuests: ParticipantAndGuest[] = [];
  memberPageIndex: number = 0;
  guestPageIndex: number = 0;
  pageSize: number = 6;
  pageSizeOptions: number[] = [6, 12, 24, 48];
  private addedParticipantIds: string[] = [];

  ngOnInit() {
    this.addedParticipantIds = this.participantsService.getParticipantIds(this.data.event.id);
    this.findAll();
  }

  private createForm = (): FormGroup => {
    return this.fb.group({
      member_id: [''],
    });
  };

  async findAll() {
    this.loading.show();
    const existingParticipantIds = [
      ...(this.data.event.participantAndGuests?.map((p) => p.id) || []),
      ...this.addedParticipantIds,
    ];

    this.membersService.findAll().subscribe({
      next: (members) => {
        this.members = members
          .filter((member) => !existingParticipantIds.includes(member.id))
          .map((member) => ({
            id: member.id,
            name: member?.person?.name || 'Nome não disponível',
            selected: false,
          }));
        this.filteredMembers = this.members;
        this.updatePaginatedMembers();
        this.loading.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar membros:', error);
        this.toast.openError('Erro ao carregar membros');
        this.loading.hide();
      },
    });

    this.guestsService.findAll().subscribe({
      next: (guests) => {
        this.guests = guests
          .filter((guest) => !existingParticipantIds.includes(guest.id))
          .map((guest) => ({
            id: guest.id,
            name: guest?.name || 'Nome não disponível',
            selected: false,
          }));
        this.filteredGuests = this.guests;
        this.updatePaginatedGuests();
        this.loading.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar convidados:', error);
        this.toast.openError('Erro ao carregar convidados');
        this.loading.hide();
      },
    });
  }

  applyMemberFilter(searchTerm: string): void {
    this.filteredMembers = this.members.filter((member) =>
      member.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    );
    this.memberPageIndex = 0;
    this.updatePaginatedMembers();
  }

  applyGuestFilter(searchTerm: string) {
    this.filteredGuests = this.guests.filter((guest) => guest.name.toLowerCase().includes(searchTerm.toLowerCase()));
    this.guestPageIndex = 0;
    this.updatePaginatedGuests();
  }

  updatePaginatedMembers() {
    const start = this.memberPageIndex * this.pageSize;
    this.paginatedMembers = this.filteredMembers.slice(start, start + this.pageSize);
  }

  updatePaginatedGuests() {
    const start = this.guestPageIndex * this.pageSize;
    this.paginatedGuests = this.filteredGuests.slice(start, start + this.pageSize);
  }

  handlePageEventMembers(event: PageEvent) {
    this.memberPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedMembers();
  }

  handlePageEventGuests(event: PageEvent) {
    this.guestPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedGuests();
  }

  onMemberSelectionChange(event: ParticipantAndGuest) {
    this.members = this.members.map((member) =>
      member.id === event.id ? { ...member, selected: event.selected } : member,
    );
    this.filteredMembers = this.filteredMembers.map((member) =>
      member.id === event.id ? { ...member, selected: event.selected } : member,
    );
    this.updatePaginatedMembers();
  }

  onGuestSelectionChange(event: ParticipantAndGuest) {
    this.guests = this.guests.map((guest) => (guest.id === event.id ? { ...guest, selected: event.selected } : guest));
    this.filteredGuests = this.filteredGuests.map((guest) =>
      guest.id === event.id ? { ...guest, selected: event.selected } : guest,
    );
    this.updatePaginatedGuests();
  }

  onMemberRemove(id: string) {
    this.members = this.members.filter((member) => member.id !== id);
    this.filteredMembers = this.filteredMembers.filter((member) => member.id !== id);
    this.updatePaginatedMembers();
  }

  onGuestRemove(id: string) {
    this.guests = this.guests.filter((guest) => guest.id !== id);
    this.filteredGuests = this.filteredGuests.filter((guest) => guest.id !== id);
    this.updatePaginatedGuests();
  }

  submitMember() {
    const selectedMembers = this.members.filter((member) => member.selected);
    if (selectedMembers.length === 0) {
      this.toast.openError('Selecione pelo menos um membro para adicionar');
      return;
    }
    this.loading.show();
    const requests = selectedMembers.map((member) =>
      this.eventsService.addMembersEvent(this.data.event.id, { member_id: member.id }),
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.toast.openSuccess(`${selectedMembers.length} membro(s) adicionado(s) com sucesso`);
        const selectedIds = selectedMembers.map((member) => member.id);
        this.addedParticipantIds = [...this.addedParticipantIds, ...selectedIds];
        selectedIds.forEach((id) => this.participantsService.addParticipant(this.data.event.id, id));
        this.members = this.members.filter((member) => !selectedIds.includes(member.id));
        this.filteredMembers = this.filteredMembers.filter((member) => !selectedIds.includes(member.id));
        this.data.event.participantAndGuests = [
          ...(this.data.event.participantAndGuests || []),
          ...selectedMembers.map((member) => ({ ...member, selected: false })),
        ];
        this.updatePaginatedMembers();
        this.loading.hide();
      },
      error: (error) => {
        console.error('Erro ao adicionar membros:', error);
        this.toast.openError('Erro ao adicionar membros');
        this.loading.hide();
      },
    });
  }

  submitGuest() {
    const selectedGuests = this.guests.filter((guest) => guest.selected);
    if (selectedGuests.length === 0) {
      this.toast.openError('Selecione pelo menos um convidado para adicionar');
      return;
    }
    this.loading.show();
    const requests = selectedGuests.map((guest) =>
      this.eventsService.addGuestsEvent(this.data.event.id, { member_id: guest.id }),
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.toast.openSuccess(`${selectedGuests.length} convidado(s) adicionado(s) com sucesso`);
        const selectedIds = selectedGuests.map((guest) => guest.id);
        this.addedParticipantIds = [...this.addedParticipantIds, ...selectedIds];
        selectedIds.forEach((id) => this.participantsService.addParticipant(this.data.event.id, id));
        this.guests = this.guests.filter((guest) => !selectedIds.includes(guest.id));
        this.filteredGuests = this.filteredGuests.filter((guest) => !selectedIds.includes(guest.id));
        this.data.event.participantAndGuests = [
          ...(this.data.event.participantAndGuests || []),
          ...selectedGuests.map((guest) => ({ ...guest, selected: false })),
        ];
        this.updatePaginatedGuests();
        this.loading.hide();
      },
      error: (error) => {
        console.error('Erro ao adicionar convidados:', error);
        this.toast.openError('Erro ao adicionar convidados');
        this.loading.hide();
      },
    });
  }
}
