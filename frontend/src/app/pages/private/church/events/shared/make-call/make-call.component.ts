import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { forkJoin } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events } from 'app/model/Events';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../events.service';
import { AddMembersGuestsComponent } from '../add-members-guests/add-members-guests.component';
import { CallToDayService } from '../call-to-day/call-to-day.service';
import { DetailsEventComponent } from './details-event/details-event.component';

@Component({
  selector: 'app-make-call',
  templateUrl: './make-call.component.html',
  styleUrl: './make-call.component.scss',
  imports: [
    MatButtonModule,
    CommonModule,
    MatCardModule,
    ColumnComponent,
    DetailsEventComponent,
    AddMembersGuestsComponent,
    MatAccordion,
    MatExpansionModule,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class MakeCallComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private eventsService: EventsService,
    private callToDayService: CallToDayService,
    private dialogRef: MatDialogRef<MakeCallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {}

  event!: Events;
  callToDays: CallToDay[] = [];
  readonly detailsEvent = signal(true);
  readonly participants = signal(false);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.show();
    forkJoin({
      event: this.eventsService.findById(this.data.event.id),
      callToDays: this.callToDayService.findAll(this.data.event.id),
    }).subscribe({
      next: ({ event, callToDays }) => {
        this.event = event;
        this.callToDays = callToDays;
        this.loading.hide();
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
        this.dialogRef.close();
      },
      complete: () => this.loading.hide(),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
