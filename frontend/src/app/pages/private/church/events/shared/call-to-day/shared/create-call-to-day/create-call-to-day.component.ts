import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { MESSAGES } from 'app/components/toast/messages';
import { CallToDay, Events } from 'app/model/Events';
import { EventsService } from 'app/pages/private/church/events/events.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-create-call-to-day',
  templateUrl: './create-call-to-day.component.html',
  styleUrl: './create-call-to-day.component.scss',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    ActionsComponent,
    MatIconModule,
    FormsModule,
    CommonModule,
    ColumnComponent,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class CreateCallToDayComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private notification: NotificationService,
    private eventsService: EventsService,
    private dialogRef: MatDialogRef<CreateCallToDayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { calltoDay: CallToDay },
  ) {
    this.callToDayForm = this.onForm();
  }

  callToDayForm: FormGroup;
  readonly minDate = new Date(1900, 0, 1);
  private destroy$ = new Subject<void>();
  searchEventControl = new FormControl('');
  filterEvents: Observable<Events[]> = new Observable<Events[]>();
  @ViewChild('startDatePicker') startDatePicker!: MatDatepicker<Date>;
  @ViewChild('endDatePicker') endDatePicker!: MatDatepicker<Date>;
  isEditMode = signal(false);
  events: Events[] = [];

  ngOnInit() {
    this.loadEvents();
    this.filteredEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onForm(): FormGroup {
    return this.fb.group(
      {
        id: [this.data?.calltoDay?.id || ''],
        event_id: [this.data?.calltoDay?.event_id || '', [Validators.required]],
        theme: [this.data?.calltoDay?.theme || '', [Validators.minLength(3), Validators.maxLength(255)]],
        start_date: [this.initializeDate(this.data?.calltoDay?.start_date), [Validators.required]],
        end_date: [this.initializeDate(this.data?.calltoDay?.end_date), [Validators.required]],
        start_time: [this.formatTime(this.data?.calltoDay?.start_time) || '', [Validators.required]],
        end_time: [this.formatTime(this.data?.calltoDay?.end_time) || '', [Validators.required]],
        location: [this.data?.calltoDay?.location || '', [Validators.maxLength(255)]],
      },
      { validators: this.dateRangeValidator },
    );
  }

  private dateRangeValidator(form: FormGroup): { [key: string]: boolean } | null {
    const startDate = form.get('start_date')?.value;
    const endDate = form.get('end_date')?.value;
    const startTime = form.get('start_time')?.value;
    const endTime = form.get('end_time')?.value;

    if (startDate && endDate && startDate > endDate) {
      return { invalidDateRange: true };
    }

    if (startDate && endDate && startTime && endTime && startDate.getTime() === endDate.getTime()) {
      if (startTime >= endTime) {
        return { invalidTimeRange: true };
      }
    }
    return null;
  }

  private loadEvents() {
    if (this.events.length > 0) {
      this.filteredEvents();
      return;
    }

    this.eventsService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.events = events;
          this.setupForm();
        },
        error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      });
  }

  private setupForm() {
    if (this.data?.calltoDay?.event_id) {
      const selectedEvent = this.events.find((event) => event.id === this.data.calltoDay.event_id);
      if (selectedEvent) {
        this.searchEventControl.setValue(selectedEvent.name);
        this.callToDayForm.get('event_id')?.setValue(selectedEvent.id);
      }
    }
  }

  private createCallToDay(data: CallToDay) {
    this.eventsService
      .create(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
          this.dialogRef.close(true);
        },
        error: () => this.notification.onError(MESSAGES.CREATE_ERROR),
      });
  }

  private updateCallToDay(data: CallToDay) {
    this.eventsService
      .update(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
          this.dialogRef.close(true);
        },
        error: () => this.notification.onError(MESSAGES.UPDATE_ERROR),
      });
  }

  private initializeDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    try {
      const dateWithoutTimezone = new Date(dateStr);
      const userTimezoneOffset = dateWithoutTimezone.getTimezoneOffset() * 60000;
      return new Date(dateWithoutTimezone.getTime() + userTimezoneOffset);
    } catch (e) {
      console.error('Error initializing date:', e);
      return null;
    }
  }

  /* private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } */

  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /* private formatTime(time: string | Date | null | undefined): string | null {
    if (!time) return null;
    if (time instanceof Date) {
      return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    }
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})(:\d{2})?$/);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
    return null;
  } */

  private formatTime(time: string | Date | null | undefined): string | null {
    if (!time) return null;

    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    if (typeof time === 'string') {
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})(:\d{2})?$/);
      if (timeMatch) {
        const hours = String(timeMatch[1]).padStart(2, '0');
        const minutes = String(timeMatch[2]).padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      const dateObj = new Date(time);
      if (!isNaN(dateObj.getTime())) {
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    return null;
  }

  private filterEvent(name: string): Events[] {
    const filterValue = name.toLowerCase();
    return this.events.filter((event) => event.name.toLowerCase().includes(filterValue));
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.callToDayForm.invalid) {
      this.callToDayForm.markAllAsTouched();
      return;
    }

    const formValues = {
      ...this.callToDayForm.value,
      start_date: this.formatDate(this.callToDayForm.value.start_date),
      end_date: this.formatDate(this.callToDayForm.value.end_date),
      start_time: this.formatTime(this.callToDayForm.value.start_time),
      end_time: this.formatTime(this.callToDayForm.value.end_time),
    };

    if (this.data?.calltoDay?.id) {
      this.updateCallToDay(formValues);
    } else {
      this.createCallToDay(formValues);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.callToDayForm.get(controlName);
    if (control?.errors) {
      return this.validationService.getErrorMessage(control);
    }
    if (this.callToDayForm.errors) {
      if (
        this.callToDayForm.errors['invalidDateRange'] &&
        (controlName === 'end_date' || controlName === 'start_date')
      ) {
        return this.validationService.getErrorMessage(this.callToDayForm);
      }
      if (
        this.callToDayForm.errors['invalidTimeRange'] &&
        (controlName === 'end_time' || controlName === 'start_time')
      ) {
        return this.validationService.getErrorMessage(this.callToDayForm);
      }
    }
    return null;
  }

  filteredEvents() {
    this.filterEvents = this.searchEventControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      map((name) => (name.length >= 1 ? this.filterEvent(name) : this.events.slice())),
      takeUntil(this.destroy$),
    );
  }

  onSelectedEvents(event: MatAutocompleteSelectedEvent) {
    const selectedEvent: Events = event.option.value;
    this.searchEventControl.setValue(selectedEvent.name);
    this.callToDayForm.get('event_id')?.setValue(selectedEvent.id);
  }

  clearDate(fieldName: string) {
    this.callToDayForm.get(fieldName)?.reset();
  }

  openCalendarStartDate(): void {
    if (this.startDatePicker) {
      this.startDatePicker.open();
    }
  }

  openCalendarEndDate(): void {
    if (this.endDatePicker) {
      this.endDatePicker.open();
    }
  }
}
