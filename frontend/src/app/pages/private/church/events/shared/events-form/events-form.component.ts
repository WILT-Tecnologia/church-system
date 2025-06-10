import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { Church } from 'app/model/Church';
import { Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import { ChurchsService } from 'app/pages/private/administrative/churchs/churchs.service';
import { EventTypesService } from 'app/pages/private/administrative/eventTypes/eventTypes.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith, Subject } from 'rxjs';
import { EventsService } from '../../events.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    ActionsComponent,
    MatGridListModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    ColumnComponent,
  ],
  providers: [provideNgxMask(), provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  selector: 'app-events-form',
  styleUrl: './events-form.component.scss',
  templateUrl: './events-form.component.html',
})
export class EventsFormComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  event: Events[] = [];
  church: Church[] = [];
  eventType: EventTypes[] = [];
  isEditMode: boolean = false;

  readonly minDate = new Date(1900, 0, 1);
  private destroy$ = new Subject<void>();

  searchChurchControl = new FormControl('');
  searchEventTypeControl = new FormControl('');

  filterChurch: Observable<Church[]> = new Observable<Church[]>();
  filterEventTypes: Observable<EventTypes[]> = new Observable<EventTypes[]>();

  @ViewChild('startDatePicker') startDatePicker!: MatDatepicker<Date>;
  @ViewChild('endDatePicker') endDatePicker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private loading: LoadingService,
    private validationService: ValidationService,
    private notification: NotificationService,
    private churchsService: ChurchsService,
    private eventTypesService: EventTypesService,
    private eventsService: EventsService,
    private dialogRef: MatDialogRef<EventsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit() {
    this.findAllEventTypes();
    this.checkEditMode();
    /* this.findAllChurchs(); */
    this.loadChurchFromLocalStorage();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    try {
      const dateWithoutTimezone = new Date(dateStr + 'T00:00:00');
      const userTimezoneOffset = dateWithoutTimezone.getTimezoneOffset() * 60000;
      return new Date(dateWithoutTimezone.getTime() + userTimezoneOffset);
    } catch (e) {
      console.error('Error initializing date:', e);
      return null;
    }
  }

  private createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data.event?.id ?? ''],
      name: [this.data.event?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      church_id: [this.data.event?.church?.id ?? '', [Validators.required]],
      event_type_id: [this.data.event?.event_type?.id ?? '', [Validators.required]],
      obs: [this.data.event?.obs ?? '', [Validators.maxLength(255)]],
      /* theme: [
        this.data.event?.theme ?? '',
        [Validators.minLength(3), Validators.maxLength(255)],
      ],
      start_date: [
        this.initializeDate(this.data.event?.start_date),
        [Validators.required],
      ],
      end_date: [
        this.initializeDate(this.data.event?.end_date),
        [Validators.required],
      ],
      start_time: [
        this.data.event?.start_time
          ? this.formatTime(this.data.event.start_time)
          : '',
        [Validators.required],
      ],
      end_time: [
        this.data.event?.end_time
          ? this.formatTime(this.data.event.end_time)
          : '',
        [Validators.required],
      ],
      location: [this.data.event?.location ?? '', Validators.maxLength(255)], */
    });
  };

  private showLoading = () => {
    this.loading.show();
  };

  private hideLoading = () => {
    this.loading.hide();
  };

  private checkEditMode = () => {
    if (this.data?.event) {
      this.isEditMode = true;

      /* const startDate = this.initializeDate(this.data.event.start_date);
      const endDate = this.initializeDate(this.data.event.end_date);
      const formattedStartTime = this.formatTime(this.data.event.start_time);
      const formattedEndTime = this.formatTime(this.data.event.end_time); */

      this.eventForm.patchValue({
        id: this.data.event.id,
        name: this.data.event.name,
        church_id: this.data.event.church?.id,
        event_type_id: this.data.event.event_type?.id,
        obs: this.data.event.obs,
        /* theme: this.data.event.theme,
        location: this.data.event.location,
        start_date: startDate,
        end_date: endDate,
        start_time: formattedStartTime || '',
        end_time: formattedEndTime || '', */
      });

      if (this.data.event.church) {
        this.searchChurchControl.setValue(this.data.event.church.name);
      }

      if (this.data.event.event_type) {
        this.searchEventTypeControl.setValue(this.data.event.event_type.name);
      }
    }
  };

  getErrorMessage = (controlName: string): string | null => {
    const control = this.eventForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  };

  private loadChurchFromLocalStorage() {
    const selectedChurchId = localStorage.getItem('selectedChurch');

    if (selectedChurchId) {
      this.eventForm.get('church_id')?.setValue(selectedChurchId);
      this.eventForm.get('church_id')?.disable();

      this.churchsService.getChurch().subscribe({
        next: (churches) => {
          const selectedChurch = churches.find((church) => church.id === selectedChurchId);
          if (selectedChurch) {
            this.searchChurchControl.setValue(selectedChurch.name);
            this.searchChurchControl.disable();
          }
        },
        error: (error) => {
          this.notification.onError(error?.error?.message ?? MESSAGES.LOADING_ERROR);
        },
      });
    }
  }

  private findAllChurchs = () => {
    this.churchsService.getChurch().subscribe({
      next: (data) => {
        this.church = data;
        this.showAllChurchs();

        if (this.isEditMode && this.data?.event?.church) {
          const currentChurch = this.church.find((c) => c.id === this.data.event?.church?.id);
          if (currentChurch) {
            this.searchChurchControl.setValue(currentChurch.name);
          }
        }
      },
      error: (error) => {
        this.notification.onError(error?.error?.message ?? MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  };

  private findAllEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe({
      next: (data) => {
        this.eventType = data;
        this.showAllEventTypes();
        if (this.isEditMode && this.data?.event?.event_type) {
          const currentEventType = this.eventType.find((et) => et.id === this.data.event?.event_type?.id);
          if (currentEventType) {
            this.searchEventTypeControl.setValue(currentEventType.name);
          }
        }
      },
      error: (error) => {
        this.notification.onError(error?.error?.message ?? MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  };

  showAllChurchs = () => {
    this.filterChurch = this.searchChurchControl.valueChanges.pipe(
      startWith(this.searchChurchControl.value || ''),
      map((value: any) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      map((name) => (name.length >= 1 ? this._filterChurch(name) : this.church.slice())),
    );
  };

  showAllEventTypes = () => {
    this.filterEventTypes = this.searchEventTypeControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      map((name) => (name.length >= 1 ? this._filterEventType(name) : this.eventType.slice())),
    );
  };

  private _filterChurch = (name: string): Church[] => {
    const filterValue = name.toLowerCase();
    return this.church.filter((church) => church.name.toLowerCase().includes(filterValue));
  };

  private _filterEventType = (name: string): EventTypes[] => {
    const filterValue = name.toLowerCase();
    return this.eventType.filter((eventType) => eventType.name.toLowerCase().includes(filterValue));
  };

  onSelectedChurch = (event: MatAutocompleteSelectedEvent) => {
    const church: Church = event.option.value;
    this.searchChurchControl.setValue(church.name);
    this.eventForm.get('church_id')?.setValue(church.id);
  };

  onSelectedEventType = (event: MatAutocompleteSelectedEvent) => {
    const eventType: EventTypes = event.option.value;
    this.searchEventTypeControl.setValue(eventType.name);
    this.eventForm.get('event_type_id')?.setValue(eventType.id);
  };

  /* clearDate(fieldName: string) {
    this.eventForm.get(fieldName)?.reset();
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
  } */

  /* formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;

    const d = new Date(date);

    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatTime(time: string | Date | null | undefined): string | null {
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

    console.warn('formatTime: Unrecognized time format or value:', time);
    return null;
  } */

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormControl) {
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  handleCancel = () => {
    this.dialogRef.close(this.eventForm.value);
  };

  handleSubmit = () => {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      this.notification.onError(MESSAGES.FORM_INVALID);
      return;
    }

    const churchIdControl = this.eventForm.get('church_id');
    const churchIdDisabled = churchIdControl?.disabled;

    if (churchIdDisabled) {
      churchIdControl?.enable();
    }

    const formValues = this.eventForm.value;

    if (churchIdDisabled) {
      churchIdControl?.disable();
    }

    const events: Events = {
      ...formValues,
      /* start_date: this.formatDate(formValues.start_date),
      end_date: this.formatDate(formValues.end_date),
      start_time: this.formatTime(formValues.start_time),
      end_time: this.formatTime(formValues.end_time), */
    };

    if (this.isEditMode) {
      this.handleUpdate(events);
    } else {
      this.handleCreate(events);
    }
  };

  handleCreate = (events: Events) => {
    this.showLoading();
    this.eventsService.create(events).subscribe({
      next: () => {
        this.hideLoading();
        this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        this.hideLoading();
        this.notification.onError(MESSAGES.CREATE_ERROR);
      },
    });
  };

  handleUpdate = (events: Events) => {
    this.showLoading();
    this.eventsService.update(events).subscribe({
      next: () => {
        this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        this.hideLoading();
        this.notification.onError(MESSAGES.UPDATE_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  };
}
