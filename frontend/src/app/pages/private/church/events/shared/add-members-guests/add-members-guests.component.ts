import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ChipComponent } from 'app/components/chip/chip.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { EventData, Events } from 'app/model/Events';

import { DetailsEventComponent } from './shared/details-event/details-event.component';

interface ParticipantAndGuest {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-add-members-guests',
  templateUrl: './add-members-guests.component.html',
  styleUrl: './add-members-guests.component.scss',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
    ColumnComponent,
    ChipComponent,
    MatDividerModule,
    DetailsEventComponent,
  ],
})
export class AddMembersGuestsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { event: Events }) {}
  EventData: EventData = {
    name: 'Acampamento da mocidade',
    date: '2025-02-25',
    time: '19:00 - 21:00',
    theme: 'Videira verdadeira',
    type: 'Acampamento',
    observations: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste at vel provident ullam cupiditate, rerum culpa tempore laboriosam neque ipsa voluptates deserunt nihil dolorum! Ducimus aspernatur doloremque quasi aliquam eius?`,
  };
  participants: ParticipantAndGuest[] = [
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: false },
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: false },
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: false },
  ];
  guests: ParticipantAndGuest[] = [
    { name: 'Peixola', selected: false },
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: true },
    { name: 'Peixola', selected: false },
    { name: 'Peixola', selected: false },
    { name: 'Peixola', selected: true },
  ];

  onSelectionChange(event: { name: string; selected: boolean }) {
    console.warn('Selection changed:', event);
    // Update your logic here
  }

  onRemove(name: string) {
    this.participants = this.participants.filter((p) => p.name !== name);
    console.warn('Removed:', name);
    // Update your logic here
  }
}
