import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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
import { Permissions, Profile } from 'app/model/Profile';

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
    ActionsComponent,
    ColumnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: Profile[] = [];
  permissions: Permissions[] = [];
  isEditMode: boolean = false;
  rendering: boolean = true;
  displayedColumns: string[] = [
    'module',
    'can_read',
    'can_write',
    'can_delete',
  ];

  constructor(
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
    console.log();
    if (this.data?.profile?.permissions) {
      this.loadPermissions();
    }

    if (this.data?.profile) {
      this.isEditMode = true;
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
      permissions: [this.data?.profile?.permissions],
    });
  }

  loadPermissions() {
    this.loading.show();
    this.profilesService.getPermissions().subscribe({
      next: (data: Permissions[]) => {
        this.permissions = data;

        if (this.isEditMode && this.data?.profile?.permissions) {
          this.permissions.forEach((permission) => {
            const profilePermission = this.data.profile.permissions.find(
              (p) => p.id === permission.id,
            );
            if (profilePermission) {
              permission.can_read = profilePermission.can_read;
              permission.can_write = profilePermission.can_write;
              permission.can_delete = profilePermission.can_delete;
            }
          });
        }

        this.rendering = false;
        console.log('Permissões carregadas:', this.permissions);
      },
      error: () => this.loading.hide(),
      complete: () => this.loading.hide(),
    });
  }

  updatePermission = (
    permissionId: string,
    action: 'can_read' | 'can_write' | 'can_delete',
    value: boolean,
  ) => {
    const permission = this.permissions.find((p) => p.id === permissionId);
    if (permission) {
      permission[action] = value;
    }
  };

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
    profile.permissions = this.permissions;

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
