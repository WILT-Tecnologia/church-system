import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Module, Profile, ProfileModule } from 'app/model/Profile';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { ProfilesService } from '../profiles.service';

@Component({
  selector: 'app-profile',
  standalone: true,
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
  profileForm: FormGroup;
  profile: Profile[] = [];
  module: Module[] = [];
  profileModule: ProfileModule[] = [];
  displayedColumns: string[] = ['name', 'can_read', 'can_write', 'can_delete'];
  isEditMode: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private loading: LoadingService,
    private toast: ToastService,
    private profilesService: ProfilesService,
    private dialogRef: MatDialogRef<ProfileComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { profile: Profile },
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.loadPermissions();
    if (this.data?.profile) {
      this.isEditMode = true;
      this.patchProfile(this.data.profile);
    }
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.profile?.id ?? ''],
      name: [
        this.data?.profile?.name ?? '',
        [Validators.required, Validators.minLength(1)],
      ],
      description: [
        this.data?.profile?.description ?? '',
        [Validators.maxLength(255)],
      ],
      status: [this.data?.profile?.status ?? true],
      permissions: this.fb.array(
        this.module.map((module) =>
          this.fb.group({
            id: [module.id],
            can_read: [module.profilesModule[0].can_read],
            can_write: [module.profilesModule[0].can_write],
            can_delete: [module.profilesModule[0].can_delete],
          }),
        ),
      ),
    });
  }

  patchProfile(profile: Profile) {
    this.profileForm.patchValue({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      status: profile.status,
    });
  }

  loadPermissions() {
    if (this.data?.profile?.id && this.isEditMode) {
      this.profilesService
        .getProfilePermissions(this.data.profile.id)
        .subscribe({
          next: (data: Module[]) => {
            this.module = data;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erro ao carregar permissões:', err);
          },
        });
    } else {
      this.profilesService.getPermissions().subscribe({
        next: (data: ProfileModule[]) => {
          this.profileModule = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar permissões:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        },
      });
    }
  }

  updatePermission(
    profileId: string,
    permissionId: string,
    field: string,
    value: boolean,
  ): void {
    const updates = { [field]: value };

    this.profilesService
      .updatePermission(profileId, permissionId, updates)
      .subscribe({
        next: () => {
          const permission = this.module.find((p) => p.id === permissionId);
          if (permission) {
            (permission as any)[field] = value;
          }
        },
        error: (err) => {
          console.error('Erro ao atualizar permissão:', err);
        },
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

  handleBack = () => {
    this.dialogRef.close();
  };

  handleSubmit = () => {
    const profile = this.profileForm.value;

    if (!profile) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate(profile.id, profile);
    } else {
      this.handleCreate(profile);
    }
  };

  handleCreate = (data: any) => {
    this.loading.show();
    this.profilesService.createProfile(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (profileId: string, data: any) => {
    this.loading.show();
    this.profilesService.updateProfile(profileId, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => {
        this.onError(MESSAGES.UPDATE_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };
}
