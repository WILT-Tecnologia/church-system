import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ColorPickerControl } from '@iplab/ngx-color-picker';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColorPickerComponent } from 'app/components/color-picker/color-picker.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { ValidationService } from 'app/services/validation/validation.service';

import { EventTypesService } from '../eventTypes.service';

@Component({
  selector: 'app-event-type',
  templateUrl: './event-type.component.html',
  styleUrls: ['./event-type.component.scss'],
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
    ColorPickerComponent,
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
    this.chromeControl.setValueFrom(this.eventTypeForm.get('color')?.value || '#ffffff');
  }

  private createForm() {
    return this.fb.group({
      id: [this.data?.eventType?.id || ''],
      name: [
        this.data?.eventType?.name || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(255)],
      ],
      description: [this.data?.eventType?.description || '', [Validators.maxLength(255)]],
      status: [this.data?.eventType?.status || true],
      color: [this.data?.eventType?.color || '#ffffff'],
      updated_at: [this.data?.eventType?.updated_at || ''],
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.eventTypeForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  toggleColorPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isVisible = !this.isVisible;
  }

  applyColor(color: string) {
    this.eventTypeForm.patchValue({ color });
    this.isVisible = false;
  }

  discardColor() {
    this.chromeControl.setValueFrom(this.eventTypeForm.get('color')?.value || '#ffffff');
    this.isVisible = false;
  }

  handleSubmit() {
    if (this.eventTypeForm.invalid) {
      return;
    }

    const eventTypeData = this.eventTypeForm.value;
    if (this.isEditMode) {
      this.handleUpdate(eventTypeData);
    } else {
      this.handleCreate();
    }
  }

  handleBack() {
    this.dialogRef.close(false);
  }

  private showLoading() {
    this.loadingService.show();
  }

  private hideLoading() {
    this.loadingService.hide();
  }

  private onSuccess(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.eventTypeForm.value);
  }

  private onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  private modeEdit() {
    if (this.data && this.data.eventType) {
      this.isEditMode = true;
      this.eventTypeForm.patchValue(this.data.eventType);
      this.handleEditMode();
    }
  }

  private handleEditMode() {
    this.eventTypesService.findById(this.data.eventType.id).subscribe((eventType: EventTypes) => {
      this.eventTypeForm.patchValue({
        ...eventType,
      });
      this.chromeControl.setValueFrom(eventType.color || '#ffffff');
    });
  }

  private handleCreate() {
    this.showLoading();
    this.eventTypesService.create(this.eventTypeForm.value).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  private handleUpdate(eventType: EventTypes) {
    this.showLoading();
    this.eventTypesService.update(eventType.id, this.eventTypeForm.value).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }
}
