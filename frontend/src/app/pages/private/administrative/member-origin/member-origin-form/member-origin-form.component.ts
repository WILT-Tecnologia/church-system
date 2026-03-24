import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { ValidationService } from 'app/services/validation/validation.service';
import { MemberOriginService } from '../member-origin.service';

@Component({
  selector: 'app-member-origin-form',
  templateUrl: './member-origin-form.component.html',
  styleUrls: ['./member-origin-form.component.scss'],
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class MemberOriginFormComponent implements OnInit {
  memberOriginForm!: FormGroup;
  isEditMode = signal(false);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private memberOriginService = inject(MemberOriginService);
  private validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<MemberOriginFormComponent>);
  private data = inject(MAT_DIALOG_DATA);

  ngOnInit() {
    this.memberOriginForm = this.createForm();
    this.editMode();
  }

  createForm() {
    const memberOrigin: MemberOrigin = this.data?.memberOrigin;

    return this.fb.group({
      id: [memberOrigin?.id ?? ''],
      name: [memberOrigin?.name ?? '', [Validators.required, Validators.maxLength(255), Validators.minLength(3)]],
      description: [memberOrigin?.description ?? '', [Validators.maxLength(255)]],
      status: [memberOrigin?.status ?? true],
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.memberOriginForm.get(controlName);
    if (control) return this.validationService.getErrorMessage(control);
    return null;
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (!this.memberOriginForm.valid) {
      this.toast.openError('Preencha os campos obrigatórios.');
      return;
    }
    const memberOriginData: MemberOrigin = this.memberOriginForm.value;
    if (this.isEditMode()) {
      this.handleUpdate(memberOriginData.id, memberOriginData);
    } else {
      this.handleCreate(memberOriginData);
    }
  }

  editMode() {
    if (this.data && this.data?.memberOrigin) {
      this.isEditMode.set(true);
    }
  }

  handleCreate(memberOriginData: MemberOrigin) {
    this.memberOriginService.create(memberOriginData).subscribe({
      next: () => this.toast.openSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
      complete: () => this.dialogRef.close(this.memberOriginForm.value),
    });
  }

  handleUpdate(memberOriginId: string, memberOriginData: MemberOrigin) {
    this.memberOriginService.update(memberOriginId!, memberOriginData).subscribe({
      next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.dialogRef.close(this.memberOriginForm.value),
    });
  }
}
