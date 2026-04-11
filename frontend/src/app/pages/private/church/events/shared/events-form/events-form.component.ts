import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { TabDirective } from '@app/components/tabs/tab.directive';
import { TabsComponent } from '@app/components/tabs/tabs.component';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Church } from '@app/model/Church';
import { Events } from '@app/model/Events';
import { EventTypes } from '@app/model/EventTypes';
import { ChurchesService } from '@app/pages/private/administrative/churches/churches.service';
import { EventTypesService } from '@app/pages/private/administrative/event-types/eventTypes.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-events-form',
  styleUrl: './events-form.component.scss',
  templateUrl: './events-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ColumnComponent,
    TabsComponent,
    TabDirective,
  ],
})
export class EventsFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private validationService = inject(ValidationService);
  private churchesService = inject(ChurchesService);
  private eventTypesService = inject(EventTypesService);
  private dialogRef = inject(MatDialogRef<EventsFormComponent>);
  private data: { event: Events; submitSubject: Subject<void>; eventTypeID?: string } =
    inject(MAT_DIALOG_DATA);
  private destroy$ = new Subject<void>();

  eventForm: FormGroup = this.createForm();
  event = signal<Events[]>([]);
  church = signal<Church[]>([]);
  eventType = signal<EventTypes[]>([]);
  isEditMode = signal(false);

  searchChurchControl = new FormControl('', [Validators.required]);
  searchEventTypeControl = new FormControl('', [Validators.required]);

  filterChurch: Observable<Church[]> = new Observable<Church[]>();
  filterEventTypes: Observable<EventTypes[]> = new Observable<EventTypes[]>();

  ngOnInit() {
    this.findAllEventTypes();
    this.checkEditMode();
    this.loadChurches();

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
    const event: Events = this.data?.event;

    return this.fb.group({
      id: [event?.id ?? ''],
      name: [
        event?.name ?? '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(255)],
      ],
      church_id: [event?.church?.id ?? '', [Validators.required]],
      event_type_id: [event?.eventType?.id ?? '', [Validators.required]],
      obs: [event?.obs ?? '', [Validators.maxLength(255)]],
    });
  }

  private checkEditMode() {
    if (this.data?.event) {
      this.isEditMode.set(true);

      this.eventForm.patchValue({
        id: this.data.event.id,
        name: this.data.event.name,
        church_id: this.data.event.church?.id,
        event_type_id: this.data.event.eventType?.id,
        obs: this.data.event.obs,
      });

      if (this.data.event.church) {
        this.searchChurchControl.setValue(this.data.event.church.name);
      }

      if (this.data.event.eventType) {
        this.searchEventTypeControl.setValue(this.data.event.eventType.name);
      }
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.eventForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  private loadChurches() {
    this.churchesService.getChurches().subscribe({
      next: (churches) => {
        this.church.set(churches);
        this.showAllChurchs();

        const selectedChurchId = localStorage.getItem('selectedChurch');

        if (selectedChurchId) {
          this.eventForm.get('church_id')?.setValue(selectedChurchId);
          this.eventForm.get('church_id')?.disable();

          const selectedChurch = churches.find((church) => church.id === selectedChurchId);
          if (selectedChurch) {
            this.searchChurchControl.setValue(selectedChurch.name);
            this.searchChurchControl.disable();
          }
        }
      },
      error: (error) => {
        this.toastService.openError(error?.error?.message ?? MESSAGES.LOADING_ERROR);
      },
    });
  }

  private findAllEventTypes() {
    this.eventTypesService.findAll().subscribe({
      next: (data) => {
        this.eventType.set(data);
        this.showAllEventTypes();

        if (this.isEditMode() && this.data?.event?.eventType) {
          const currentEventType = this.eventType().find(
            (et) => et.id === this.data.event?.eventType?.id,
          );

          if (currentEventType) {
            this.searchEventTypeControl.setValue(currentEventType.name);
          }
        }

        if (!this.isEditMode() && this.data?.eventTypeID) {
          const typeID = this.data.eventTypeID;
          const currentEventType = data.find((et) => et.id === typeID);
          if (currentEventType) {
            this.searchEventTypeControl.setValue(currentEventType.name);
            this.eventForm.get('event_type_id')?.setValue(currentEventType.id);
            this.searchEventTypeControl.disable();
            this.eventForm.get('event_type_id')?.disable();
          }
        }
      },
      error: (error) => {
        this.toastService.openError(error?.error?.message ?? MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  showAllChurchs() {
    this.filterChurch = this.searchChurchControl.valueChanges.pipe(
      startWith(this.searchChurchControl.value || ''),
      map((value: any) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      map((name) => (name.length >= 0 ? this._filterChurch(name) : this.church().slice())),
    );
  }

  showAllEventTypes() {
    this.filterEventTypes = this.searchEventTypeControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : (value?.name ?? ''))),
      map((name) =>
        name.length >= 0
          ? this._filterEventType(name).filter((et) => et.status)
          : this.eventType()
              .slice()
              .filter((et) => et.status),
      ),
    );
  }

  private _filterChurch(name: string): Church[] {
    const filterValue = name.toLowerCase();
    return this.church().filter((church) => church.name.toLowerCase().includes(filterValue));
  }

  private _filterEventType(name: string): EventTypes[] {
    const filterValue = name.toLowerCase();
    return this.eventType().filter((eventType) =>
      eventType.name.toLowerCase().includes(filterValue),
    );
  }

  onSelectedChurch(event: MatAutocompleteSelectedEvent) {
    const church: Church = event.option.value;
    this.searchChurchControl.setValue(church.name);
    this.eventForm.get('church_id')?.setValue(church.id);
  }

  onSelectedEventType(event: MatAutocompleteSelectedEvent) {
    const eventType: EventTypes = event.option.value;
    this.searchEventTypeControl.setValue(eventType.name);
    this.eventForm.get('event_type_id')?.setValue(eventType.id);
  }

  handleSubmit() {
    this.eventForm.markAllAsTouched();
    this.searchChurchControl.markAsTouched();
    this.searchEventTypeControl.markAsTouched();

    if (this.eventForm.valid) {
      const event: Events = this.eventForm.getRawValue();
      this.dialogRef?.close(event);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
