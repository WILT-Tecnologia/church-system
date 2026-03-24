import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Occupation } from 'app/model/Occupation';
import { ValidationService } from 'app/services/validation/validation.service';
import { OccupationsService } from '../occupations.service';

@Component({
  selector: 'app-occupation',
  templateUrl: './occupation.component.html',
  styleUrls: ['./occupation.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ColumnComponent,
    ReactiveFormsModule,
    CommonModule,
    ActionsComponent,
  ],
})
export class OccupationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private occupationsService = inject(OccupationsService);
  private validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<OccupationComponent>);
  private data = inject(MAT_DIALOG_DATA);
  occupationForm!: FormGroup;
  isEditMode = signal(false);

  ngOnInit() {
    this.occupationForm = this.createForm();
    this.handleEditMode();
  }

  getErrorMessage(controlName: string) {
    const control = this.occupationForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  createForm() {
    const occupation: Occupation = this.data?.occupation;

    return this.fb.group({
      id: [occupation?.id ?? ''],
      name: [occupation?.name ?? '', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      description: [occupation?.description ?? '', [Validators.maxLength(255)]],
      status: [occupation?.status ?? true],
      updated_at: [occupation?.updated_at ?? ''],
    });
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (this.occupationForm.invalid) {
      this.toast.openError('Preencha todos os campos obrigatórios!');
      return;
    }

    const occupationData = this.occupationForm.value;
    if (this.isEditMode()) {
      this.updateOccupation(occupationData);
    } else {
      this.createOccupation(occupationData);
    }
  }

  createOccupation(occupation: Occupation) {
    this.occupationsService.createOccupation(occupation).subscribe({
      next: () => this.toast.openSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
      complete: () => {
        this.dialogRef.close(occupation);
      },
    });
  }

  updateOccupation(occupation: Occupation) {
    this.occupationsService.updateOccupation(occupation.id!, occupation).subscribe({
      next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.dialogRef.close(occupation),
    });
  }

  handleEditMode() {
    if (!this.data?.occupation?.id) {
      this.isEditMode.set(false);
      return;
    }

    this.isEditMode.set(true);
    this.occupationsService.findOccupationById(this.data.occupation.id).subscribe((occupation: Occupation) => {
      this.occupationForm.patchValue({
        ...occupation,
      });
    });
  }
}
