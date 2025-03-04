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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import dayjs from 'dayjs';
import { ActionsComponent } from '../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { LoadingService } from '../../../../../components/loading/loading.service';

import { MESSAGES } from '../../../../../components/toast/messages';
import { ToastService } from '../../../../../components/toast/toast.service';
import { EventTypes } from '../../../../../model/EventTypes';
import { ValidationService } from '../../../../../services/validation/validation.service';
import { EventTypesService } from '../eventTypes.service';

@Component({
  selector: 'app-eventType',
  standalone: true,
  templateUrl: './eventType.component.html',
  styleUrls: ['./eventType.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class EventTypeComponent implements OnInit {
  eventTypeForm: FormGroup;
  isEditMode: boolean = false;
  eventTypeId: string | null = null;

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
  }

  modeEdit = () => {
    if (this.data && this.data.eventType) {
      this.isEditMode = true;
      this.eventTypeId = this.data.eventType.id;
      this.eventTypeForm.patchValue(this.data.eventType);
      this.handleEditMode();
    }
  };

  createForm = () => {
    return (this.eventTypeForm = this.fb.group({
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
      updated_at: [this.data?.eventType?.updated_at || ''],
    }));
  };

  getErrorMessage(controlName: string) {
    const control = this.eventTypeForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
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

  handleEditMode = () => {
    this.eventTypesService
      .getEventTypesById(this.eventTypeId!)
      .subscribe((eventType: EventTypes) => {
        this.eventTypeForm.patchValue({
          ...eventType,
          updated_at: dayjs(eventType.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
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
      .updateEventTypes(eventTypeId!, this.eventTypeForm.value)
      .subscribe({
        next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
        error: () => this.onError(MESSAGES.UPDATE_ERROR),
        complete: () => this.hideLoading(),
      });
  };
}
