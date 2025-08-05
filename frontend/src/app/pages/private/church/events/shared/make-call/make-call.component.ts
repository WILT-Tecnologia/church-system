import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, map } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, EventData } from 'app/model/Events';

import { AddMembersGuestsComponent } from '../add-members-guests/add-members-guests.component';
import { DetailsEventComponent } from '../add-members-guests/shared/details-event/details-event.component';
import { CallToDayService } from '../call-to-day/call-to-day.service';

@Component({
  selector: 'app-make-call',
  templateUrl: './make-call.component.html',
  styleUrl: './make-call.component.scss',
  imports: [CommonModule, MatCardModule, ColumnComponent, DetailsEventComponent, AddMembersGuestsComponent],
})
export class MakeCallComponent implements OnInit {
  event: EventData | null = null;
  callToDays: CallToDay[] = [];
  private callToDayService = inject(CallToDayService);
  private loading = inject(LoadingService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<MakeCallComponent>);
  @Inject(MAT_DIALOG_DATA) public data!: { event: EventData };

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.loading.show();
    forkJoin({
      event: this.data.event
        ? this.callToDayService.findAll(this.data?.event?.event?.id).pipe(map(() => this.data.event))
        : this.data.event,
      callToDays: this.callToDayService.findAll(this.data?.event?.event?.id),
    }).subscribe({
      next: ({ event, callToDays }) => {
        if (event?.event?.id) {
          this.event = event?.event?.id;
          this.callToDays = callToDays;
          this.loading.hide();
        }
      },
      error: () => {
        this.toast.openError('Erro ao carregar dados da chamada');
        this.loading.hide();
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
