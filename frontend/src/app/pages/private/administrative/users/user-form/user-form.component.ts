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
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Profile } from 'app/model/Profile';
import { User } from 'app/model/User';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';
import { ProfilesService } from '../../profiles/profiles.service';

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
    MatAutocompleteModule,
    MatSelectModule,
    CommonModule,
    ColumnComponent,
  ],
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly loadingService = inject(LoadingService);
  private readonly dialogRef = inject(MatDialogRef<UserFormComponent>);
  private readonly profilesService = inject(ProfilesService);
  private readonly toastService = inject(ToastService);
  private readonly validationService = inject(ValidationService);
  private readonly data: { user: User; submitSubject?: Subject<void> } = inject(MAT_DIALOG_DATA);
  private destroy$ = new Subject<void>();

  userForm: FormGroup = this.createForm();
  users = signal<User[]>([]);
  profiles = signal<Profile[]>([]);
  isEdit = signal(false);
  hide = signal(true);
  change_password = signal(false);

  ngOnInit() {
    this.loadProfiles();

    if (this.data?.user) {
      this.isEdit.set(true);
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();

      this.userForm.patchValue({
        profile_id: this.data.user.profile_id,
      });
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
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
    this.profilesService.getAllProfiles().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
      },
      error: () => {
        this.toastService.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  toggleHide() {
    this.hide.set(!this.hide());
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

  handleSubmit() {
    this.userForm.markAllAsTouched();

    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    } else {
      this.toastService.openError(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
