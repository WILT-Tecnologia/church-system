import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Modules } from 'app/model/Modules';
import { ValidationService } from 'app/services/validation/validation.service';

import { ModuleService } from '../modules.service';

@Component({
  selector: 'app-module-form',
  imports: [
    ColumnComponent,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    ActionsComponent,
  ],
  templateUrl: './module-form.component.html',
  styleUrl: './module-form.component.scss',
})
export class ModuleFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private modulesService: ModuleService,
    private toast: ToastService,
    private loadingService: LoadingService,
    private dialogRef: MatDialogRef<ModuleFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { module: Modules },
  ) {
    this.moduleForm = this.createForm();
  }

  moduleForm: FormGroup;
  modules: Modules[] = [];
  isEdit: boolean = false;
  hide: boolean = true;
  change_password: boolean = false;

  ngOnInit() {
    this.loadModules();
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.module?.id ?? ''],
      name: [this.data?.module?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    });
  }

  loadModules() {
    this.modulesService.getAll().subscribe({
      next: (modules) => {
        this.modules = modules;
      },
      error: () => {
        this.toast.openError('Erro ao carregar módulos.');
      },
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.moduleForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.moduleForm.value);
  }

  onError(message: string) {
    this.loadingService.hide();
    this.toast.openError(message);
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const user = this.moduleForm.value;

    if (!user) {
      return;
    }

    if (this.change_password) {
      this.moduleForm.get('password')?.setValidators([Validators.required]);
    }

    if (this.isEdit) {
      this.handleUpdate(user.id, user);
    } else {
      this.handleCreate(user);
    }
  }

  handleCreate(data: any) {
    this.loadingService.show();
    this.modulesService.create(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: (error) => {
        const errorMessage = error.error.message ?? MESSAGES.CREATE_ERROR;
        this.onError(errorMessage);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  handleUpdate(userId: string, data: any) {
    this.loadingService.show();
    this.modulesService.update(userId, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: (error) => {
        const errorMessage = error.error.message ?? MESSAGES.UPDATE_ERROR;
        this.onError(errorMessage);
      },
      complete: () => this.loadingService.hide(),
    });
  }
}
