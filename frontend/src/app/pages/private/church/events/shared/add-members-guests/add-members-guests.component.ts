import { CommonModule } from '@angular/common';
import { Component, Inject, input, OnInit } from '@angular/core';
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
import { Events, ParticipantAndGuest } from 'app/model/Events';

import { GuestsService } from '../../../guests/guests.service';
import { MembersService } from '../../../members/members.service';
import { EventsService } from '../../events.service';

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
    private dialogRef: MatDialogRef<AddMembersGuestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {
    this.participantAndGuestForm = this.createForm();
  }

  event = input<Events | null>();
  participantAndGuestForm: FormGroup;
  members: ParticipantAndGuest[] = [];
  guests: ParticipantAndGuest[] = [];
  allMembers: ParticipantAndGuest[] = [];
  allGuests: ParticipantAndGuest[] = [];
  filteredMembers: ParticipantAndGuest[] = [];
  filteredGuests: ParticipantAndGuest[] = [];
  paginatedMembers: ParticipantAndGuest[] = [];
  paginatedGuests: ParticipantAndGuest[] = [];
  memberPageIndex: number = 0;
  guestPageIndex: number = 0;
  pageSize: number = 6;
  pageSizeOptions: number[] = [6, 12, 24, 48];

  ngOnInit() {
    this.findAll();
  }

  private createForm = (): FormGroup => {
    return this.fb.group({
      member_id: [''],
    });
  };

  findAll() {
    this.loading.show();
    this.eventsService.findById(this.data.event.id).subscribe({
      next: (event) => {
        this.data.event = {
          ...event,
          participantAndGuests: [
            ...(event.participants?.map((p) => ({
              id: p.id ?? '',
              name: p.person?.name || 'Nome não disponível',
              selected: false,
              isGuest: false,
            })) || []),
            ...(event.guests?.map((g) => ({
              id: g.person_id ?? g.id ?? '',
              name: g.name || 'Nome não disponível',
              selected: false,
              isGuest: true,
            })) || []),
          ],
        };

        forkJoin([this.membersService.findAll(), this.guestsService.findAll()]).subscribe({
          next: ([members, guests]) => {
            this.allMembers = members.map((member) => ({
              id: member.id,
              name: member?.person?.name || 'Nome não disponível',
              selected: false,
              isGuest: false,
            }));
            this.allGuests = guests.map((guest) => ({
              id: guest.id, // Guest ID from guests table
              name: guest?.name || 'Nome não disponível',
              selected: false,
              isGuest: true,
            }));

            const existingParticipantIds = (this.data.event.participantAndGuests ?? []).map((p) => p.id);
            this.members = this.allMembers.filter((member) => !existingParticipantIds.includes(member.id));
            this.guests = this.allGuests.filter((guest) => !existingParticipantIds.includes(guest.id));

            this.filteredMembers = [...this.members];
            this.filteredGuests = [...this.guests];
            this.updatePaginatedMembers();
            this.updatePaginatedGuests();
            this.loading.hide();
          },
          error: () => {
            this.toast.openError('Erro ao carregar membros ou convidados');
            this.loading.hide();
          },
        });
      },
      error: () => {
        this.toast.openError('Erro ao carregar evento');
        this.loading.hide();
      },
    });
  }

  applyMemberFilter(searchTerm: string): void {
    const normalizedSearchTerm = this.normalizeString(searchTerm.trim());
    this.filteredMembers = this.members.filter((member) =>
      member.name ? this.normalizeString(member.name).includes(normalizedSearchTerm) : false,
    );
    this.memberPageIndex = 0;
    this.updatePaginatedMembers();
  }

  applyGuestFilter(searchTerm: string): void {
    const normalizedSearchTerm = this.normalizeString(searchTerm.trim());
    this.filteredGuests = this.guests.filter((guest) =>
      guest.name ? this.normalizeString(guest.name).includes(normalizedSearchTerm) : false,
    );
    this.guestPageIndex = 0;
    this.updatePaginatedGuests();
  }

  private normalizeString(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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
        this.data.event.participantAndGuests = [
          ...(this.data.event.participantAndGuests ?? []),
          ...selectedMembers.map((member) => ({ ...member, selected: false, isGuest: false })),
        ];
        this.members = this.members.filter((member) => !member.selected);
        this.filteredMembers = this.filteredMembers.filter((member) => !member.selected);
        this.updatePaginatedMembers();
        this.loading.hide();
      },
      error: () => {
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
      this.eventsService.addGuestsEvent(this.data.event.id, { person_id: guest.id }),
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.toast.openSuccess(`${selectedGuests.length} convidado(s) adicionado(s) com sucesso`);
        this.data.event.participantAndGuests = [
          ...(this.data.event.participantAndGuests ?? []),
          ...selectedGuests.map((guest) => ({
            id: guest.id,
            name: guest.name,
            selected: false,
            isGuest: true,
          })),
        ];
        this.guests = this.guests.filter((guest) => !guest.selected);
        this.filteredGuests = this.filteredGuests.filter((guest) => !guest.selected);
        this.updatePaginatedGuests();
        this.loading.hide();
      },
      error: () => {
        this.toast.openError('Erro ao adicionar convidados');
        this.loading.hide();
      },
    });
  }

  removeParticipant(participant: ParticipantAndGuest) {
    this.loading.show();
    const isGuest = participant.isGuest ?? false;
    if (!participant.id) {
      this.toast.openError('ERRO: Participante não encontrado');
      this.loading.hide();
      return;
    }
    const request = isGuest
      ? this.eventsService.removeGuestEvent(this.data.event.id, participant.id)
      : this.eventsService.removeMemberEvent(this.data.event.id, participant.id);
    request.subscribe({
      next: () => {
        this.toast.openSuccess(`${isGuest ? 'Convidado' : 'Membro'} removido com sucesso`);
        this.data.event.participantAndGuests = (this.data.event.participantAndGuests ?? []).filter(
          (p) => p.id !== participant.id,
        );
        if (!isGuest) {
          const member = this.allMembers.find((m) => m.id === participant.id);
          if (member) {
            this.members = [...this.members, { ...member, selected: false, isGuest: false }];
            this.filteredMembers = [...this.filteredMembers, { ...member, selected: false, isGuest: false }];
            this.updatePaginatedMembers();
          }
        } else {
          const guest = this.allGuests.find((g) => g.id === participant.id);
          if (guest) {
            this.guests = [...this.guests, { ...guest, selected: false, isGuest: true }];
            this.filteredGuests = [...this.filteredGuests, { ...guest, selected: false, isGuest: true }];
            this.updatePaginatedGuests();
          }
        }
        this.loading.hide();
      },
      error: () => {
        this.toast.openError(`Não foi possível remover ${isGuest ? 'convidado' : 'membro'}`);
        this.loading.hide();
      },
    });
  }

  isParticipantMember(participant: ParticipantAndGuest): boolean {
    return this.allMembers.some((member) => member.id === participant.id);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
