import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Profile } from 'app/model/Profile';
import { User } from 'app/model/User';
import { ValidationService } from 'app/services/validation/validation.service';
import { ProfilesService } from '../../profiles/profiles.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    ActionsComponent,
    ColumnComponent,
    MatAutocompleteModule,
    MatSelectModule,
  ],
})
export class UserFormComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent>);
  private readonly usersService = inject(UsersService);
  private readonly profilesService = inject(ProfilesService);
  private readonly toast = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(MAT_DIALOG_DATA);
  userForm!: FormGroup;
  users = signal<User[]>([]);
  profiles = signal<Profile[]>([]);
  isEdit = signal(false);
  hide = signal(true);
  change_password = signal(false);

  ngOnInit() {
    this.userForm = this.createForm();
    this.loadProfiles();
    this.checkEditMode();
  }

  createForm(): FormGroup {
    const user: User = this.data?.user;

    return this.fb.group({
      id: [user?.id ?? ''],
      name: [user?.name ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      email: [
        user?.email ?? '',
        [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(255)],
      ],
      password: [
        user?.password ?? '',
        user
          ? []
          : [
              Validators.required,
              this.validationService.passwordValidator(),
              Validators.minLength(8),
              Validators.maxLength(30),
            ],
      ],
      status: [user?.status ?? true],
      change_password: [user?.change_password ?? true],
      profile_id: [user?.profile_id ?? '', Validators.required],
    });
  }

  loadProfiles() {
    this.profilesService.finAllProfiles().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles.filter((p) => p.status));
      },
      error: () => {
        this.toast.openError('Erro ao carregar perfis.');
      },
    });
  }

  toggleHide() {
    this.hide.set(!this.hide());
  }

  checkEditMode() {
    if (this.data?.user) {
      this.isEdit.set(true);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();

      this.userForm.patchValue({
        profile_id: this.data.user.profile_id,
      });
    }
  }

  changePassword() {
    this.change_password.set(!this.change_password());
    const passwordControl = this.userForm.get('password');

    if (this.change_password()) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(30)]);
    } else {
      passwordControl?.reset();
    }

    passwordControl?.updateValueAndValidity();
  }

  getErrorMessage(controlName: string) {
    const control = this.userForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.userForm.value);
  }

  onError(message: string) {
    this.loadingService.hide();
    this.toast.openError(message);
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const user = this.userForm.value;

    if (!user) {
      return;
    }

    if (this.change_password()) {
      this.userForm.get('password')?.setValidators([Validators.required]);
    }

    if (this.isEdit()) {
      this.handleUpdate(user);
    } else {
      this.handleCreate(user);
    }
  }

  handleCreate(data: User) {
    this.loadingService.show();
    this.usersService.createUser(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: (error) => this.onError(error.error.message ?? MESSAGES.CREATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  handleUpdate(user: User) {
    this.loadingService.show();
    this.usersService.updateUser(user.id, user).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: (error) => this.onError(error.error.message ?? MESSAGES.UPDATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }
}
