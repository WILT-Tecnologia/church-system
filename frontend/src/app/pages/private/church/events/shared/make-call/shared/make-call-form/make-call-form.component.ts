import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { forkJoin, map, Observable, startWith } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CallToDay, Events } from 'app/model/Events';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';

import { EventsService } from '../../../../events.service';
import { AddMembersGuestsComponent } from '../../../add-members-guests/add-members-guests.component';
import { CallToDayService } from '../../../call-to-day/call-to-day.service';
import { DetailsEventComponent } from '../details-event/details-event.component';

@Component({
  selector: 'app-make-call-form',
  templateUrl: './make-call-form.component.html',
  styleUrls: ['./make-call-form.component.scss'],
  imports: [
    MatButtonModule,
    CommonModule,
    MatCardModule,
    ColumnComponent,
    DetailsEventComponent,
    AddMembersGuestsComponent,
    MatAccordion,
    MatExpansionModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIcon,
  ],
  providers: [provideNgxMask(), provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
})
export class MakeCallFormComponent implements OnInit {
  makeCallForm: FormGroup;
  events!: Events;
  callToDays: CallToDay[] = [];
  callToDayControl: FormControl = new FormControl('');
  readonly detailsEvent = signal(true);
  readonly participants = signal(false);
  filterCallToDay: Observable<CallToDay[]> = new Observable<CallToDay[]>();

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private toast: ToastService,
    private loading: LoadingService,
    private eventsService: EventsService,
    private callToDayService: CallToDayService,
    private dialogRef: MatDialogRef<MakeCallFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {
    this.makeCallForm = this.createForm();
    this.callToDayControl = this.makeCallForm.get('call_to_day_id') as FormControl;
  }

  ngOnInit() {
    this.loadData();
  }

  private createForm() {
    return this.fb.group({
      event_id: [this.data.event.id, Validators.required],
      call_to_day_id: ['', Validators.required],
    });
  }

  private loadData() {
    this.loading.show();
    forkJoin({
      event: this.eventsService.findById(this.data.event.id),
      callToDays: this.callToDayService.findAll(this.data.event.id),
    }).subscribe({
      next: ({ event, callToDays }) => {
        this.events = event;
        this.callToDays = callToDays;
        this.showAllCallToDay();
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

  getErrorMessage(controlName: string) {
    const control = this.makeCallForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  showAllCallToDay() {
    this.filterCallToDay = this.makeCallForm.get('call_to_day_id')!.valueChanges.pipe(
      startWith(''),
      map((value: CallToDay | string) => (typeof value === 'string' ? value : this.displayCallToDay(value))),
      map((name) => (name.length >= 1 ? this.filterCallToDayFn(name) : this.callToDays)),
    );
  }

  private filterCallToDayFn(name: string): CallToDay[] {
    return this.callToDays.filter((ctd) => this.displayCallToDay(ctd).toLowerCase().includes(name.toLowerCase()));
  }

  onCallToDaySelected(event: MatAutocompleteSelectedEvent) {
    const selectedCallToDay = event.option.value as CallToDay;
    this.makeCallForm.get('call_to_day_id')?.setValue(selectedCallToDay.id);
    this.callToDayControl.setValue(selectedCallToDay);
  }

  displayCallToDay(callToDay: CallToDay): string {
    if (!callToDay?.event?.name) return '';
    const startDate = new Date(callToDay.start_date).toLocaleDateString('pt-BR');
    const endDate = new Date(callToDay.end_date).toLocaleDateString('pt-BR');
    const startTime = callToDay.start_time;
    const endTime = callToDay.end_time;
    return `${callToDay.event.name} | ${startDate} às ${startTime} até ${endDate} às ${endTime}`;
  }

  onClear() {
    this.makeCallForm.get('call_to_day_id')?.setValue('');
    this.callToDayControl.setValue('');
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
