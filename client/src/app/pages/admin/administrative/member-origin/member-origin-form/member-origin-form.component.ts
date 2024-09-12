import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { CoreService } from 'app/service/core/core.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { MemberOriginService } from '../member-origin.service';

@Component({
  selector: 'app-member-origin-form',
  templateUrl: './member-origin-form.component.html',
  styleUrls: ['./member-origin-form.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class MemberOriginFormComponent implements OnInit {
  memberOriginForm: FormGroup;
  isEditMode: boolean = false;
  memberOriginId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private core: CoreService,
    private snackbarService: SnackbarService,
    private loadingService: LoadingService,
    private memberOriginService: MemberOriginService,
    private validationService: ValidationService
  ) {
    this.memberOriginForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ],
      ],
      description: ['', [Validators.maxLength(255)]],
      status: [true],
      updated_at: [''],
    });
  }

  ngOnInit() {
    this.memberOriginId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.memberOriginId;

    if (this.isEditMode) {
      this.handleEdit();
    }
  }

  get pageTitle() {
    return this.isEditMode
      ? 'Editar origem de membro'
      : 'Cadastrar origem de membro';
  }

  getErrorMessage(controlName: string) {
    const control = this.memberOriginForm.get(controlName);
    if (control) return this.validationService.getErrorMessage(control);
    return null;
  }

  handleBack() {
    this.core.handleBack();
  }

  handleSubmit = () => {
    if (!this.memberOriginForm.valid) {
      return;
    }

    this.isEditMode ? this.handleUpdate() : this.handleCreate();
  };

  handleEdit = () => {
    this.loadingService.show();
    this.memberOriginService
      .getMemberOriginById(this.memberOriginId!)
      .subscribe((memberOrigin) => {
        const formattedUpdatedAt = memberOrigin.updated_at
          ? dayjs(memberOrigin.updated_at).format('DD/MM/YYYY [às] HH:mm')
          : '';

        this.memberOriginForm.patchValue({
          ...memberOrigin,
          updated_at: formattedUpdatedAt,
        });
      });
    this.loadingService.hide();
  };

  handleCreate = () => {
    this.loadingService.show();
    this.memberOriginService
      .createMemberOrigin(this.memberOriginForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess(
            'Origem de membro criada com sucesso!'
          );
          this.core.handleBack();
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(
            error.error.message || 'Erro ao criar a origem de membro!'
          );
        },
      });
    this.loadingService.hide();
  };

  handleUpdate = () => {
    this.loadingService.show();
    const { updated_at, ...updatedMemberOriginData } =
      this.memberOriginForm.value;

    this.memberOriginService
      .updateMemberOrigin(this.memberOriginId!, updatedMemberOriginData)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess(
            'Origem de membro atualizada com sucesso!'
          );
          this.core.handleBack();
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(
            error.error.message || 'Erro ao atualizar a origem de membro!'
          );
        },
      });
    this.loadingService.hide();
  };
}
