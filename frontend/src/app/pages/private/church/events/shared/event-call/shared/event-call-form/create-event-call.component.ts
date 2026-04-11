import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
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
import { ColumnComponent } from '@app/components/column/column.component';
import { FormatsPipe } from '@app/components/crud/pipes/formats.pipe';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { EventCall, Events } from '@app/model/Events';
import { EventCallService } from '@app/pages/private/church/events/shared/event-call/event-call.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';

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
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly toastService = inject(ToastService);
  private readonly eventCallService = inject(EventCallService);
  private readonly dialogRef = inject(MatDialogRef<CreateEventCallComponent>);
  private readonly data: { eventCall?: EventCall; event?: Events; submitSubject: Subject<void> } =
    inject(MAT_DIALOG_DATA);
  private destroy$ = new Subject<void>();

  eventCallForm: FormGroup = this.createForm();
  events = signal<Events[]>([]);
  isEditMode = signal(false);
  minDate = new Date(1900, 0, 1);
  startDatePicker = viewChild(MatDatepicker);
  endDatePicker = viewChild(MatDatepicker);
  searchEventControl = new FormControl('', [Validators.required]);

  filterEvents: Observable<Events[]> = new Observable<Events[]>();

  ngOnInit() {
    if (this.data?.eventCall) {
      this.isEditMode.set(true);
    }

    if (this.data?.event) {
      this.events.set([this.data.event]);
      this.setupForm();
    } else {
      this.loadEvents();
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const eventCall = this.data?.eventCall;

    return this.fb.group(
      {
        id: [eventCall?.id ?? ''],
        event_id: [eventCall?.event_id ?? '', [Validators.required]],
        theme: [eventCall?.theme ?? '', [Validators.minLength(3), Validators.maxLength(255)]],
        start_date: [this.initializeDate(eventCall?.start_date), [Validators.required]],
        end_date: [this.initializeDate(eventCall?.end_date), [Validators.required]],
        start_time: [this.formatTime(eventCall?.start_time) ?? '', [Validators.required]],
        end_time: [this.formatTime(eventCall?.end_time) ?? '', [Validators.required]],
        location: [eventCall?.location ?? '', [Validators.maxLength(255)]],
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
        .getAllEventCalls(this.data?.event?.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const selectedEvent = this.events().find(
              (event) => event.id === this.data?.event?.id,
            ) as Events;

            this.events.set([selectedEvent]);
            this.setupForm();
          },
          error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
        });
    }
  }

  private setupForm() {
    if (this.data?.eventCall || this.data?.event) {
      const selectedEvent = this.events().find(
        (event) => event.id === this.data?.event?.id,
      ) as Events;

      if (selectedEvent) {
        this.searchEventControl.setValue(selectedEvent.name);
        this.eventCallForm.get('event_id')?.setValue(selectedEvent.id);
        this.eventCallForm.get('event_id')?.disable();
        this.searchEventControl.disable();
      }
    }
  }

  private initializeDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    try {
      const dateWithoutTimezone = new Date(dateStr);
      const userTimezoneOffset = dateWithoutTimezone.getTimezoneOffset() * 60000;
      return new Date(dateWithoutTimezone.getTime() + userTimezoneOffset);
    } catch (e) {
      this.toastService.openError(`Error initializing date:${e}`);
      return null;
    }
  }

  private formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

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
    return this.events().filter((event) => event.name.toLowerCase().includes(filterValue));
  }

  handleSubmit() {
    this.eventCallForm.markAllAsTouched();

    if (this.eventCallForm.valid) {
      const rawValues = this.eventCallForm.getRawValue();

      const formValues = {
        ...rawValues,
        event_id: this.data?.event?.id,
        start_date: this.formatDate(rawValues.start_date),
        end_date: this.formatDate(rawValues.end_date),
        start_time: this.formatTime(rawValues.start_time),
        end_time: this.formatTime(rawValues.end_time),
      };

      this.dialogRef?.close(formValues);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
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
      map((name) => (name.length >= 1 ? this.filterEvent(name) : this.events().slice())),
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
}
