import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { Church } from 'app/model/Church';
import { Events } from 'app/model/Events';
import { EventTypes } from 'app/model/EventTypes';
import { ChurchsService } from 'app/pages/admin/administrative/churchs/churchs.service';
import { EventTypesService } from 'app/pages/admin/administrative/eventTypes/eventTypes.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { map, Observable, startWith } from 'rxjs';
import { EventsService } from '../events.service';

@Component({
  selector: 'app-events-form',
  templateUrl: './events-form.component.html',
  styleUrl: './events-form.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class EventsFormComponent implements OnInit {
  eventForm: FormGroup;
  event: Events[] = [];
  church: Church[] = [];
  eventType: EventTypes[] = [];
  isEditMode: boolean = false;

  searchChurchControl = new FormControl('');
  searchEventTypeControl = new FormControl('');

  filterChurch: Observable<Church[]> = new Observable<Church[]>();
  filterEventTypes: Observable<EventTypes[]> = new Observable<EventTypes[]>();

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
      obs: [this.data.event?.obs ?? '', [Validators.max(255)]],
    });
  };

  checkEditMode() {
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
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.eventForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  findAllChurchs() {
    this.churchsService.getChurch().subscribe({
      next: (data) => {
        this.church = data;
      },
      error: (error) => {
        this.notification.onError(
          error ? error.error.message : MESSAGES.LOADING_ERROR,
        );
      },
      complete: () => this.loading.hide(),
    });
  }

  findAllEventTypes() {
    this.eventTypesService.getEventTypes().subscribe({
      next: (data) => {
        this.eventType = data;
      },
      error: (error) => {
        this.notification.onError(
          error ? error.error.message : MESSAGES.LOADING_ERROR,
        );
      },
      complete: () => this.loading.hide(),
    });
  }

  showAllChurchs() {
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
  }

  showAllEventTypes() {
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
  }

  private _filterChurch(name: string): Church[] {
    const filterValue = name.toLowerCase();
    return this.church.filter((church) =>
      church.name.toLowerCase().includes(filterValue),
    );
  }

  private _filterEventType(name: string): EventTypes[] {
    const filterValue = name.toLowerCase();
    return this.eventType.filter((eventType) =>
      eventType.name.toLowerCase().includes(filterValue),
    );
  }

  onSelectedChurch(event: MatAutocompleteSelectedEvent) {
    const church = event.option.value;
    this.searchChurchControl.setValue(church.name);
    this.eventForm.get('church_id')?.setValue(church.id);
  }

  onSelectedEventType(event: MatAutocompleteSelectedEvent) {
    const eventType = event.option.value;
    this.searchEventTypeControl.setValue(eventType.name);
    this.eventForm.get('event_type_id')?.setValue(eventType.id);
  }

  handleCancel() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const event = this.eventForm.value;

    if (!event) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate(event.id, event);
    } else {
      this.handleCreate(event);
    }
  }

  handleCreate(event: Events) {
    this.loading.show();
    this.eventsService.create(event).subscribe({
      next: () => {
        this.loading.hide();
        this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading.hide();
        this.notification.onError(MESSAGES.CREATE_ERROR);
      },
    });
  }

  handleUpdate(id: string, event: Events) {
    this.loading.show();
    this.eventsService.update(id, event).subscribe({
      next: () => {
        this.loading.hide();
        this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading.hide();
        this.notification.onError(MESSAGES.UPDATE_ERROR);
      },
    });
  }
}
