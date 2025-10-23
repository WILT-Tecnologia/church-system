import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Modules } from 'app/model/Modules';
import { Profile, ProfileModule } from 'app/model/Profile';
import { AuthService } from 'app/services/auth/auth.service';
import { ValidationService } from 'app/services/validation/validation.service';

import { ModuleService } from '../../modules/modules.service';
import { ProfilesService } from '../profiles.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ActionsComponent,
    ColumnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private loading: LoadingService,
    private toast: ToastService,
    private profilesService: ProfilesService,
    private moduleService: ModuleService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<ProfileComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { profile: Profile },
  ) {
    this.profileForm = this.createForm();
  }

  profileForm: FormGroup;
  profile: Profile[] = [];
  modules: Modules[] = [];
  profileModule: ProfileModule[] = [];
  displayedColumns: string[] = ['name', 'can_read', 'can_write', 'can_delete'];
  isEditMode: boolean = false;

  ngOnInit() {
    this.loadModules();
    if (this.data?.profile) {
      this.isEditMode = true;
      this.patchProfile(this.data.profile);
    }
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.profile?.id ?? ''],
      name: [this.data?.profile?.name ?? '', [Validators.required, Validators.minLength(1)]],
      description: [this.data?.profile?.description ?? '', [Validators.maxLength(255)]],
      status: [this.data?.profile?.status ?? true],
      guard_name: [this.data?.profile?.guard_name ?? 'sanctum'],
      modules: this.fb.array([]),
    });
  }

  get modulesFormArray(): FormArray {
    const control = this.profileForm.get('modules') as FormArray;

    return control;
  }

  loadModules() {
    this.loading.show();
    this.moduleService.getAll().subscribe({
      next: (data) => {
        this.modules = data;

        if (this.isEditMode && this.data?.profile?.id) {
          this.profilesService.getProfileById(this.data.profile.id).subscribe({
            next: (profileData) => {
              this.patchProfile(profileData);

              const modulesArray = Array.isArray(profileData.modules) ? profileData.modules : [];
              this.initModulesFormArray(modulesArray);

              this.cdr.detectChanges();
            },
            error: () => this.onError(MESSAGES.LOADING_ERROR),
            complete: () => this.loading.hide(),
          });
        } else {
          // Modo Criação
          this.initModulesFormArray([]);
          this.loading.hide();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
    });
  }

  initModulesFormArray(profileModules: any[]) {
    const modulesArray = this.modulesFormArray;

    if (!modulesArray) {
      console.error('modulesFormArray não está inicializado.');
      return;
    }

    // Limpa o FormArray antes de popular
    modulesArray.clear();

    this.modules.forEach((module) => {
      // Procura o módulo existente usando o module_id (pois o backend retorna module_id, não id)
      const existingModule = profileModules.find((pm) => pm.module_id === module.id);

      // 3. CORREÇÃO CRÍTICA: Desreferenciar as propriedades diretamente, sem '.pivot'
      modulesArray.push(
        this.fb.group({
          module_id: [module.id],
          module_name: [module.name],
          can_read: [existingModule ? existingModule.can_read : false],
          can_write: [existingModule ? existingModule.can_write : false],
          can_delete: [existingModule ? existingModule.can_delete : false],
        }),
      );
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.profileForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  onSuccess(message: string) {
    this.loading.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.profileForm.value);
  }

  onError(message: string) {
    this.loading.hide();
    this.toast.openError(message);
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const profile = this.profileForm.value;

    if (!profile) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate(profile.id, profile);
    } else {
      this.handleCreate(profile);
    }
  }

  handleCreate = (data: Profile) => {
    this.loading.show();
    this.profilesService.createProfile(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (id: string, data: Profile) => {
    this.loading.show();
    this.profilesService.updateProfile(id, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  private patchProfile(profile: Profile) {
    this.profileForm.patchValue({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      status: profile.status,
    });
  }
}
