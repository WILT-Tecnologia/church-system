import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { ColorPickerComponent } from 'app/components/color-picker/color-picker.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { EventTypes } from 'app/model/EventTypes';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-event-type',
  templateUrl: './event-type.component.html',
  styleUrls: ['./event-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ColorPickerComponent,
    CommonModule,
  ],
})
export class EventTypeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<EventTypeComponent>);
  private data: { eventType: EventTypes; submitSubject?: Subject<void> } = inject(MAT_DIALOG_DATA);

  eventTypeForm: FormGroup = this.createForm();
  isEditMode = signal(false);
  isVisible = signal(false);
  chromeControl = new ColorPickerControl().hidePresets();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    if (this.data && this.data.eventType) {
      this.isEditMode.set(true);
      this.eventTypeForm.patchValue(this.data.eventType);
      this.chromeControl.setValueFrom(this.data.eventType.color || '#ffffff');
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  private createForm() {
    const eventType = this.data?.eventType;

    return this.fb.group({
      id: [eventType?.id ?? ''],
      name: [eventType?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: [eventType?.description ?? '', [Validators.maxLength(255)]],
      status: [eventType?.status ?? true],
      color: [eventType?.color ?? '#ffffff'],
      updated_at: [eventType?.updated_at ?? ''],
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.eventTypeForm.get(controlName);
    if (!control) return null;
    return this.validationService.getErrorMessage(control);
  }

  toggleColorPicker(event: MouseEvent) {
    event.stopPropagation();
    this.isVisible.set(!this.isVisible());
  }

  applyColor(color: string) {
    this.eventTypeForm.patchValue({ color });
    this.isVisible.set(false);
  }

  discardColor() {
    this.chromeControl.setValueFrom(this.eventTypeForm.get('color')?.value || '#ffffff');
    this.isVisible.set(false);
  }

  handleSubmit() {
    this.eventTypeForm.markAllAsTouched();
    if (this.eventTypeForm.valid) {
      this.dialogRef?.close(this.eventTypeForm.value);
    } else {
      this.toast.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
