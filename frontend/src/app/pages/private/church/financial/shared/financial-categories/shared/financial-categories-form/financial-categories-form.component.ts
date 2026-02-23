import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { FinancialCategories } from 'app/model/FinancialCategories';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject } from 'rxjs';
import { FinancialCategoriesService } from '../../financial-categories.service';

@Component({
  selector: 'app-financial-categories-form',
  templateUrl: './financial-categories-form.component.html',
  styleUrl: './financial-categories-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class FinancialCategoriesFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private financialCategoriesService = inject(FinancialCategoriesService);
  private toast = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<FinancialCategoriesFormComponent>);
  private data = inject(MAT_DIALOG_DATA) as { financialCategories: FinancialCategories };

  financialCategoriesForm!: FormGroup;
  isEditMode = signal(false);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.financialCategoriesForm = this.createForm();
    this.checkEditMode();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const pat = this.data.financialCategories as FinancialCategories;

    return this.fb.group({
      id: [pat?.id ?? ''],
      name: [pat?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [pat?.description ?? '', [Validators.maxLength(255)]],
      status: [pat?.status ?? true, [Validators.required]],
    });
  }

  private checkEditMode() {
    if (this.data.financialCategories) {
      this.isEditMode.set(true);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.financialCategoriesForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  private loadData() {
    if (this.isEditMode()) {
      this.financialCategoriesForm.patchValue(this.data.financialCategories);
    }
  }

  handleSubmit() {
    if (this.financialCategoriesForm.invalid) {
      this.financialCategoriesForm.markAllAsTouched();
      this.toast.openError(MESSAGES.FORM_INVALID);
      return;
    }

    if (this.isEditMode()) {
      this.updateFinancialCategories(this.data?.financialCategories?.id, this.financialCategoriesForm.getRawValue());
    } else {
      this.handleCreate(this.financialCategoriesForm.getRawValue());
    }
  }

  private handleCreate(data: FinancialCategories) {
    this.financialCategoriesService.createFinancialCategories(data).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef?.close(data);
      },
      error: (error) => {
        this.toast.openError(error.error.message);
      },
    });
  }

  private updateFinancialCategories(id: string, data: FinancialCategories) {
    this.financialCategoriesService.updateFinancialCategories(id, data).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef?.close(data);
      },
      error: (error) => {
        this.toast.openError(error.error.message);
      },
    });
  }

  handleCancel() {
    this.dialogRef.close(false);
  }
}
