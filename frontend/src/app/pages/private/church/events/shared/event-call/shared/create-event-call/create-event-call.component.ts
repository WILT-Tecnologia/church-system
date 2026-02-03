import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
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

import { provideNgxMask } from 'ngx-mask';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { MESSAGES } from 'app/components/toast/messages';
import { EventCall, Events } from 'app/model/Events';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { EventCallService } from '../../event-call.service';

@Component({
  selector: 'app-create-event-call',
  templateUrl: './create-event-call.component.html',
  styleUrl: './create-event-call.component.scss',
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
export class CreateEventCallComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<CreateEventCallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventCall?: EventCall; event?: Events },
  ) {
    this.eventCallForm = this.onForm();
  }

  @ViewChild('endDatePicker') endDatePicker!: MatDatepicker<Date>;
  @ViewChild('startDatePicker') startDatePicker!: MatDatepicker<Date>;
  eventCallForm: FormGroup;
  readonly minDate = new Date(1900, 0, 1);
  private destroy$ = new Subject<void>();
  private eventCallService = inject(EventCallService);
  searchEventControl = new FormControl('');
  filterEvents: Observable<Events[]> = new Observable<Events[]>();
  isEditMode = signal(false);
  events: Events[] = [];

  ngOnInit() {
    if (this.data?.eventCall) {
      this.isEditMode.set(true);
    }
    if (this.data?.event) {
      this.events = [this.data.event];
      this.setupForm();
    } else {
      this.loadEvents();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onForm(): FormGroup {
    return this.fb.group(
      {
        id: [this.data?.eventCall?.id || ''],
        event_id: [this.data?.eventCall?.event_id || '', [Validators.required]],
        theme: [this.data?.eventCall?.theme || '', [Validators.minLength(3), Validators.maxLength(255)]],
        start_date: [this.initializeDate(this.data?.eventCall?.start_date), [Validators.required]],
        end_date: [this.initializeDate(this.data?.eventCall?.end_date), [Validators.required]],
        start_time: [this.formatTime(this.data?.eventCall?.start_time) || '', [Validators.required]],
        end_time: [this.formatTime(this.data?.eventCall?.end_time) || '', [Validators.required]],
        location: [this.data?.eventCall?.location || '', [Validators.maxLength(255)]],
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
    if (this.events.length > 0 || this.data?.event) {
      this.filteredEvents();
      return;
    }

    if (this.data?.event) {
      this.eventCallService
        .findAll(this.data?.event?.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const selectedEvent = this.events.find((event) => event.id === this.data?.event?.id) as Events;

            this.events = [selectedEvent];
            this.setupForm();
          },
          error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
        });
    }
  }

  private setupForm() {
    if (this.data?.eventCall || this.data?.event) {
      const selectedEvent = this.events.find((event) => event.id === this.data?.event?.id) as Events;

      if (selectedEvent) {
        this.searchEventControl.setValue(selectedEvent.name);
        this.eventCallForm.get('event_id')?.setValue(selectedEvent.id);
        this.eventCallForm.get('event_id')?.disable();
        this.searchEventControl.disable();
      }
    }
  }

  private createEventCall(data: EventCall) {
    const eventId = this.data?.event?.id;
    if (!eventId) {
      this.notification.onError('Evento não encontrato!');
      return;
    }
    this.eventCallService
      .create(eventId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
          this.dialogRef.close(true);
        },
        error: () => this.notification.onError(MESSAGES.CREATE_ERROR),
      });
  }

  private updatedEventCall(data: EventCall) {
    const eventId = this.data?.event?.id;
    const callId = this.data?.eventCall?.id;
    if (!eventId || !callId) {
      this.notification.onError('Evento ou chamada não encontrada!');
      return;
    }
    this.eventCallService
      .update(eventId, callId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.notification.onError(error?.error?.error || MESSAGES.UPDATE_ERROR);
        },
      });
  }

  private initializeDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    try {
      const dateWithoutTimezone = new Date(dateStr);
      const userTimezoneOffset = dateWithoutTimezone.getTimezoneOffset() * 60000;
      return new Date(dateWithoutTimezone.getTime() + userTimezoneOffset);
    } catch (e) {
      this.notification.onError(`Error initializing date:${e}`);
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
    if (this.eventCallForm.invalid) {
      this.eventCallForm.markAllAsTouched();
      return;
    }

    const formValues = {
      ...this.eventCallForm.value,
      event_id: this.data?.event?.id,
      start_date: this.formatDate(this.eventCallForm.value.start_date),
      end_date: this.formatDate(this.eventCallForm.value.end_date),
      start_time: this.formatTime(this.eventCallForm.value.start_time),
      end_time: this.formatTime(this.eventCallForm.value.end_time),
    };

    if (this.data?.eventCall?.id) {
      this.updatedEventCall(formValues);
    } else {
      this.createEventCall(formValues);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.eventCallForm.get(controlName);
    if (control?.errors) {
      return this.validationService.getErrorMessage(control);
    }
    if (this.eventCallForm.errors) {
      if (
        this.eventCallForm.errors['invalidDateRange'] &&
        (controlName === 'end_date' || controlName === 'start_date')
      ) {
        return this.validationService.getErrorMessage(this.eventCallForm);
      }
      if (
        this.eventCallForm.errors['invalidTimeRange'] &&
        (controlName === 'end_time' || controlName === 'start_time')
      ) {
        return this.validationService.getErrorMessage(this.eventCallForm);
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
    this.eventCallForm.get('event_id')?.setValue(selectedEvent.id);
  }

  clearDate(fieldName: string) {
    this.eventCallForm.get(fieldName)?.reset();
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
