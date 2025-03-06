import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
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
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { Church } from 'app/model/Church';
import { Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith, Subject } from 'rxjs';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { ChurchsService } from '../../../administrative/churchs/churchs.service';
import { EventTypesService } from '../../../administrative/eventTypes/eventTypes.service';
import { EventsService } from '../events.service';

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
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
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

  @ViewChild('start_date') start_date!: MatDatepicker<Date>;
  @ViewChild('end_date') end_date!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private loading: LoadingService,
    private validationService: ValidationService,
    private notification: NotificationService,
    private churchsService: ChurchsService,
    private eventTypesService: EventTypesService,
    private eventsService: EventsService,
    private dialogRef: MatDialogRef<EventsFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { event: Events },
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit() {
    this.findAllChurchs();
    this.findAllEventTypes();
    this.checkEditMode();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data.event?.id ?? ''],
      name: [
        this.data.event?.name ?? '',
        [Validators.required, Validators.min(3), Validators.max(255)],
      ],
      church_id: [this.data.event?.church?.id ?? '', [Validators.required]],
      event_type_id: [
        this.data.event?.event_type?.id ?? '',
        [Validators.required],
      ],
      theme: [
        this.data.event?.theme ?? '',
        [Validators.required, Validators.min(3), Validators.max(255)],
      ],
      obs: [this.data.event?.obs ?? '', [Validators.max(255)]],
      start_date: [this.data.event?.start_date ?? '', [Validators.required]],
      end_date: [this.data.event?.end_date ?? '', [Validators.required]],
      start_time: [this.data.event?.start_time ?? '', [Validators.required]],
      end_time: [this.data.event?.end_time ?? '', [Validators.required]],
      location: [this.data.event?.location ?? '', Validators.max(255)],
    });
  };

  private showLoading = () => {
    this.loading.show();
  };

  hideLoading = () => {
    this.loading.hide();
  };

  checkEditMode = () => {
    if (this.data?.event) {
      this.isEditMode = true;

      if (this.data?.event?.church) {
        this.searchChurchControl.setValue(this.data.event?.church?.name);
        this.eventForm.get('church_id')?.setValue(this.data.event?.church?.id);
      }

      if (this.data?.event?.event_type) {
        this.searchEventTypeControl.setValue(this.data.event?.event_type?.name);
        this.eventForm
          .get('event_type_id')
          ?.setValue(this.data.event?.event_type?.id);
      }
    }
  };

  getErrorMessage = (controlName: string): string | null => {
    const control = this.eventForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  };

  findAllChurchs = () => {
    this.churchsService.getChurch().subscribe({
      next: (data) => {
        this.church = data;
      },
      error: (error) => {
        this.notification.onError(
          error ? error.error.message : MESSAGES.LOADING_ERROR,
        );
      },
      complete: () => this.hideLoading(),
    });
  };

  findAllEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe({
      next: (data) => {
        this.eventType = data;
      },
      error: (error) => {
        this.notification.onError(
          error ? error.error.message : MESSAGES.LOADING_ERROR,
        );
      },
      complete: () => this.hideLoading(),
    });
  };

  showAllChurchs = () => {
    this.filterChurch = this.searchChurchControl.valueChanges.pipe(
      startWith(this.searchChurchControl.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this._filterChurch(name) : this.church,
      ),
    );
  };

  showAllEventTypes = () => {
    this.filterEventTypes = this.searchEventTypeControl.valueChanges.pipe(
      startWith(this.searchEventTypeControl.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this._filterEventType(name) : this.eventType,
      ),
    );
  };

  private _filterChurch = (name: string): Church[] => {
    const filterValue = name.toLowerCase();
    return this.church.filter((church) =>
      church.name.toLowerCase().includes(filterValue),
    );
  };

  private _filterEventType = (name: string): EventTypes[] => {
    const filterValue = name.toLowerCase();
    return this.eventType.filter((eventType) =>
      eventType.name.toLowerCase().includes(filterValue),
    );
  };

  onSelectedChurch = (event: MatAutocompleteSelectedEvent) => {
    const church = event.option.value;
    this.searchChurchControl.setValue(church.name);
    this.eventForm.get('church_id')?.setValue(church.id);
  };

  onSelectedEventType = (event: MatAutocompleteSelectedEvent) => {
    const eventType = event.option.value;
    this.searchEventTypeControl.setValue(eventType.name);
    this.eventForm.get('event_type_id')?.setValue(eventType.id);
  };

  clearDate(fieldName: string) {
    this.eventForm.get(fieldName)?.reset();
  }

  openCalendarStartDate(): void {
    if (this.start_date) {
      this.start_date.open();
    }
  }

  openCalendarEndDate(): void {
    if (this.end_date) {
      this.end_date.open();
    }
  }

  formatDate(date: Date | string | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatTime(time: string | Date | null): string | null {
    if (!time) return null;

    // Se for um objeto Date, formata como "HH:mm"
    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    // Se for uma string, processa como antes
    const timeParts = time.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }

    return time;
  }

  handleCancel = () => {
    this.dialogRef.close();
  };

  handleSubmit = () => {
    if (this.eventForm.invalid) {
      return;
    }

    const formValues = this.eventForm.value;

    const event = {
      ...formValues,
      start_date: this.formatDate(formValues.start_date),
      end_date: this.formatDate(formValues.end_date),
      start_time: this.formatTime(formValues.start_time),
      end_time: this.formatTime(formValues.end_time),
    };

    console.log(event);

    if (this.isEditMode) {
      this.handleUpdate(event.id, event);
    } else {
      this.handleCreate(event);
    }
  };

  handleCreate = (event: Events) => {
    this.showLoading();
    this.eventsService.create(event).subscribe({
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

  handleUpdate = (id: string, event: Events) => {
    this.showLoading();
    this.eventsService.update(id, event).subscribe({
      next: () => {
        this.hideLoading();
        this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        this.hideLoading();
        this.notification.onError(MESSAGES.UPDATE_ERROR);
      },
    });
  };
}
