import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  ChromePickerComponent,
  ColorPickerControl,
} from '@iplab/ngx-color-picker';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { ValidationService } from 'app/services/validation/validation.service';
import dayjs from 'dayjs';
import { EventTypesService } from '../eventTypes.service';

@Component({
  selector: 'app-eventType',
  templateUrl: './eventType.component.html',
  styleUrls: ['./eventType.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    ColumnComponent,
    ActionsComponent,
    ChromePickerComponent,
    CommonModule,
  ],
})
export class EventTypeComponent implements OnInit {
  eventTypeForm: FormGroup;
  isEditMode: boolean = false;
  isVisible: boolean = false;
  chromeControl = new ColorPickerControl().hidePresets();

  constructor(
    private fb: FormBuilder,
    private eventTypesService: EventTypesService,
    private toast: ToastService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<EventTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventType: EventTypes },
  ) {
    this.eventTypeForm = this.createForm();
  }

  ngOnInit() {
    this.modeEdit();
    // Initialize color picker with form's color value
    this.chromeControl.setValueFrom(
      this.eventTypeForm.get('color')?.value || '#000000',
    );
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.eventType?.id || ''],
      name: [
        this.data?.eventType?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      description: [
        this.data?.eventType?.description || '',
        [Validators.maxLength(255)],
      ],
      status: [this.data?.eventType?.status || true],
      color: [this.data?.eventType?.color || '#000000'], // Add color field
      updated_at: [this.data?.eventType?.updated_at || ''],
    });
  };

  getErrorMessage(controlName: string) {
    const control = this.eventTypeForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  toggleColorPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isVisible = !this.isVisible;
  }

  applyColor(event: MouseEvent) {
    event.stopPropagation();
    const selectedColor = this.chromeControl.value.toHexString();
    this.eventTypeForm.patchValue({ color: selectedColor });
    this.isVisible = false;
  }

  discardColor(event: MouseEvent) {
    event.stopPropagation();
    this.chromeControl.setValueFrom(
      this.eventTypeForm.get('color')?.value || '#000000',
    );
    this.isVisible = false;
  }

  handleSubmit = () => {
    if (this.eventTypeForm.invalid) {
      return;
    }

    const eventTypeData = this.eventTypeForm.value;
    if (this.isEditMode) {
      this.handleUpdate(eventTypeData.id);
    } else {
      this.handleCreate();
    }
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  showLoading() {
    this.loadingService.show();
  }

  hideLoading() {
    this.loadingService.hide();
  }

  onSuccess(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.eventTypeForm.value);
  }

  onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  modeEdit = () => {
    if (this.data && this.data.eventType) {
      this.isEditMode = true;
      this.eventTypeForm.patchValue(this.data.eventType);
      this.handleEditMode();
    }
  };

  handleEditMode = () => {
    this.eventTypesService
      .getEventTypesById(this.data.eventType.id)
      .subscribe((eventType: EventTypes) => {
        this.eventTypeForm.patchValue({
          ...eventType,
          updated_at: dayjs(eventType.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
        this.chromeControl.setValueFrom(eventType.color || '#000000');
      });
  };

  handleCreate = () => {
    this.showLoading();
    this.eventTypesService
      .createEventTypes(this.eventTypeForm.value)
      .subscribe({
        next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
        error: () => this.onError(MESSAGES.CREATE_ERROR),
        complete: () => this.hideLoading(),
      });
  };

  handleUpdate = (eventTypeId: string) => {
    this.showLoading();
    this.eventTypesService
      .updateEventTypes(eventTypeId, this.eventTypeForm.value)
      .subscribe({
        next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
        error: () => this.onError(MESSAGES.UPDATE_ERROR),
        complete: () => this.hideLoading(),
      });
  };
}
