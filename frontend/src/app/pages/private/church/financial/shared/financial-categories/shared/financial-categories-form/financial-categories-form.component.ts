import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ColumnComponent } from 'app/components/column/column.component';
import { TabDirective } from 'app/components/tabs/tab.directive';
import { TabsComponent } from 'app/components/tabs/tabs.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { FinancialCategories } from 'app/model/FinancialCategories';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';

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
    TabsComponent,
    TabDirective,
  ],
})
export class FinancialCategoriesFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly dialogRef = inject(MatDialogRef<FinancialCategoriesFormComponent>);
  private readonly data: { financialCategories: FinancialCategories; submitSubject?: Subject<void> } =
    inject(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  public financialCategoriesForm!: FormGroup;
  public isEditMode = signal(false);

  ngOnInit() {
    this.financialCategoriesForm = this.createForm();
    this.checkEditMode();
    this.loadData();

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
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
    this.financialCategoriesForm.markAllAsTouched();

    if (this.financialCategoriesForm.valid) {
      this.dialogRef.close(this.financialCategoriesForm.value);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
