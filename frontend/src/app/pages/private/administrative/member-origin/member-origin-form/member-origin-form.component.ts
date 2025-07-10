import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
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
import { LoadingService } from 'app/components/loading/loading.service';
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
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class MemberOriginFormComponent implements OnInit {
  memberOriginForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private loadingService: LoadingService,
    private memberOriginService: MemberOriginService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<MemberOriginFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memberOrigin: MemberOrigin },
  ) {
    this.memberOriginForm = this.createForm();
  }

  ngOnInit() {
    this.editMode();
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.memberOrigin?.id || ''],
      name: [
        this.data?.memberOrigin?.name || '',
        [Validators.required, Validators.maxLength(255), Validators.minLength(3)],
      ],
      description: [this.data?.memberOrigin?.description || '', [Validators.maxLength(255)]],
      status: [this.data?.memberOrigin?.status || true],
    });
  };

  getErrorMessage(controlName: string) {
    const control = this.memberOriginForm.get(controlName);
    if (control) return this.validationService.getErrorMessage(control);
    return null;
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit = () => {
    if (!this.memberOriginForm.valid) {
      return;
    }
    const memberOriginData = this.memberOriginForm.value;
    this.isEditMode ? this.handleUpdate(memberOriginData.id) : this.handleCreate();
  };

  editMode = () => {
    if (this.data && this.data?.memberOrigin) {
      this.isEditMode = true;
      this.memberOriginService.findById(this.data.memberOrigin.id).subscribe((memberOrigin: MemberOrigin) => {
        this.memberOriginForm.patchValue({
          ...memberOrigin,
        });
      });
    }
  };

  handleCreate = () => {
    this.loadingService.show();
    this.memberOriginService.create(this.memberOriginForm.value).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(this.memberOriginForm.value);
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.CREATE_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  };

  handleUpdate = (memberOriginId: string) => {
    this.loadingService.show();
    this.memberOriginService.update(memberOriginId!, this.memberOriginForm.value).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef.close(this.memberOriginForm.value);
      },
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  };
}
