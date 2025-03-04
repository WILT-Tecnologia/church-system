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
import { ToastService } from '../../../../../components/toast/toast.service';
import { MemberOrigin } from '../../../../../model/MemberOrigins';
import { ValidationService } from '../../../../../services/validation/validation.service';
import { MemberOriginService } from '../member-origin.service';

@Component({
  selector: 'app-member-origin-form',
  templateUrl: './member-origin-form.component.html',
  styleUrls: ['./member-origin-form.component.scss'],
  standalone: true,
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
  memberOriginId: string | null = null;

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
    if (this.data && this.data?.memberOrigin) {
      this.isEditMode = true;
      this.memberOriginId = this.data.memberOrigin.id;
      this.memberOriginForm.patchValue(this.data.memberOrigin);
      this.handleEdit();
    }
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.memberOrigin?.id || ''],
      name: [
        this.data?.memberOrigin?.name || '',
        [
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ],
      ],
      description: [
        this.data?.memberOrigin?.description || '',
        [Validators.maxLength(255)],
      ],
      status: [this.data?.memberOrigin?.status || true],
      updated_at: [this.data?.memberOrigin?.updated_at || ''],
    });
  };

  get pageTitle() {
    return this.isEditMode
      ? 'Editando origem de membro'
      : 'Criando origem de membro';
  }

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
    this.isEditMode
      ? this.handleUpdate(memberOriginData.id)
      : this.handleCreate();
  };

  handleEdit = () => {
    this.memberOriginService
      .getMemberOriginById(this.memberOriginId!)
      .subscribe((memberOrigin: MemberOrigin) => {
        this.memberOriginForm.patchValue({
          ...memberOrigin,
          updated_at: dayjs(memberOrigin.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
      });
  };

  handleCreate = () => {
    this.loadingService.show();
    this.memberOriginService
      .createMemberOrigin(this.memberOriginForm.value)
      .subscribe({
        next: () => {
          this.toast.openSuccess('Origem de membro criada com sucesso!');
          this.dialogRef.close(this.memberOriginForm.value);
        },
        error: (error) => {
          this.loadingService.hide();
          this.toast.openError('Erro ao criar a origem de membro!');
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };

  handleUpdate = (memberOriginId: string) => {
    this.loadingService.show();
    this.memberOriginService
      .updateMemberOrigin(memberOriginId!, this.memberOriginForm.value)
      .subscribe({
        next: () => {
          this.toast.openSuccess('Origem de membro atualizada com sucesso!');
          this.dialogRef.close(this.memberOriginForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.toast.openError('Erro ao atualizar a origem de membro!');
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };
}
