import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ColumnComponent } from 'app/components/column/column.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Occupation } from 'app/model/Occupation';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-occupation',
  templateUrl: './occupation.component.html',
  styleUrls: ['./occupation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ],
})
export class OccupationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<OccupationComponent>);
  private data: { occupation: Occupation; submitSubject?: Subject<void> } = inject(MAT_DIALOG_DATA);

  occupationForm: FormGroup = this.createForm();
  isEditMode = signal(false);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    if (this.data && this.data?.occupation) {
      this.isEditMode.set(true);
      this.occupationForm.patchValue(this.data.occupation);
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  private createForm() {
    const occupation: Occupation = this.data?.occupation;

    return this.fb.group({
      id: [occupation?.id ?? ''],
      name: [occupation?.name ?? '', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      description: [occupation?.description ?? '', [Validators.maxLength(255)]],
      status: [occupation?.status ?? true],
      updated_at: [occupation?.updated_at ?? ''],
    });
  }

  handleSubmit() {
    this.occupationForm.markAllAsTouched();

    if (this.occupationForm.valid) {
      this.dialogRef.close(this.occupationForm.value);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.occupationForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }
}
