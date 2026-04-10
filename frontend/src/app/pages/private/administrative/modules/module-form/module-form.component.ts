import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Modules } from '@app/model/Modules';
import { ValidationService } from '@app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';
import { ModuleService } from '../modules.service';

interface ModuleType {
  value: string;
  title: string;
}

@Component({
  selector: 'app-module-form',
  templateUrl: './module-form.component.html',
  styleUrl: './module-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ColumnComponent,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatDividerModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
  ],
})
export class ModuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);
  private modulesService = inject(ModuleService);
  private toast = inject(ToastService);
  private loadingService = inject(LoadingService);
  private dialogRef = inject(MatDialogRef<ModuleFormComponent>);
  private data: { module: Modules; submitSubject?: Subject<void> } = inject(MAT_DIALOG_DATA);

  moduleForm: FormGroup = this.createForm();
  modules: Modules[] = [];
  private isEdit = signal(false);
  private destroy$ = new Subject<void>();

  modulesTypes: ModuleType[] = [
    { value: 'Administrativo', title: 'Administrativo' },
    { value: 'Igreja', title: 'Igreja' },
  ];

  ngOnInit() {
    this.loadModules();

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  createForm() {
    const module = this.data?.module;

    if (module) {
      this.isEdit.set(true);
    }

    return this.fb.group({
      id: [module?.id ?? ''],
      name: [
        module?.name ?? '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(255)],
      ],
      context: [module?.context ?? '', [Validators.required]],
    });
  }

  loadModules() {
    this.modulesService.findAll().subscribe({
      next: (modules) => {
        this.modules = modules;
      },
      error: (error) => this.toast.openError(error.error.message ?? MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.moduleForm.get(controlName);
    if (!control) return null;
    return this.validationService.getErrorMessage(control);
  }

  handleSubmit() {
    this.moduleForm.markAllAsTouched();
    if (this.moduleForm.valid) {
      this.dialogRef?.close(this.moduleForm.value);
    } else {
      this.toast.openError(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
