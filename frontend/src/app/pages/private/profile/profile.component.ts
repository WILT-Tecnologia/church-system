import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { User } from 'app/model/User';
import { AuthService } from 'app/services/auth/auth.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';
import { UsersService } from '../administrative/users/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    ColumnComponent,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CommonModule,
    ActionsComponent,
    MatCheckboxModule,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  uiAvatar = signal('');
  userData = signal<User | null>(null);
  isLoading = signal(false);
  hide = signal(true);
  change_password = signal(false);
  profileForm!: FormGroup;
  avatarUrl =
    'https://ui-avatars.com/api/?background=random&bold=true&length=2&rounded=true&uppercase=true&size=128&name=';
  private destroy$ = new Subject<void>();
  router = inject(Router);

  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private toast: ToastService,
    private loading: LoadingService,
    private validationService: ValidationService,
    private authService: AuthService,
  ) {
    this.profileForm = this.initForm();
  }

  ngOnInit() {
    this.avatar();
    this.getUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleHide() {
    this.hide.update((value) => !value);
  }

  togglePasswordField(checked: boolean) {
    this.change_password.set(checked);
    const passwordControl = this.profileForm.get('password');

    if (checked) {
      passwordControl?.setValidators([
        Validators.required,
        this.validationService.passwordValidator(),
        Validators.minLength(8),
        Validators.maxLength(30),
      ]);
    } else {
      passwordControl?.clearValidators();
      passwordControl?.reset();
    }

    passwordControl?.updateValueAndValidity();
  }

  private initForm() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(255)]],
      password: [''],
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.profileForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  private avatar = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const userName = user.name || '';
        this.uiAvatar.set(`${this.avatarUrl}${userName}`);
      } else {
        this.uiAvatar.set(this.avatarUrl);
      }
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error);
      this.uiAvatar.set(this.avatarUrl);
    }
  };

  private getUserData(): void {
    this.loading.show();
    this.loadFromLocalStorage();
    const userId = this.getUserIdFromLocalStorage();

    if (userId) {
      this.userService
        .findById(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.userData.set(user);
            this.updateLocalStorage(user);
            this.updateFormWithUserData(user);
            this.authService.updateUser(user);
            this.updateAvatar(user.name);
            this.loading.hide();
          },
          error: (err) => {
            console.error('Erro ao carregar dados do usuário:', err);
            this.toast.openError('Não foi possível carregar os dados do perfil');
            this.loading.hide();
          },
        });
    } else {
      this.loading.hide();
    }
  }

  private getUserIdFromLocalStorage(): string | null {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.id || null;
      }
    } catch (error) {
      console.error('Erro ao obter ID do usuário do localStorage:', error);
    }
    return null;
  }

  private loadFromLocalStorage(): void {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        this.userData.set(user);
        this.updateFormWithUserData(user);
        this.updateAvatar(user.name);
      }
    } catch (error) {
      console.error('Erro ao processar dados do usuário do localStorage:', error);
      this.uiAvatar.set(this.avatarUrl);
    }
  }

  private updateFormWithUserData(user: User): void {
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      password: '',
    });
  }

  private updateAvatar(userName: string): void {
    this.uiAvatar.set(`${this.avatarUrl}${userName}`);
  }

  handleCancel() {
    this.router.navigateByUrl('/');
  }

  handleSubmit() {
    if (this.profileForm.invalid) {
      this.toast.openSuccess('Por favor, corrija os erros no formulário');
      return;
    }

    const userId = this.getUserIdFromLocalStorage();
    if (!userId) {
      this.toast.openSuccess('Não foi possível identificar o usuário');
      return;
    }

    const userData = {
      ...this.profileForm.value,
      id: userId,
    };

    if (!userData.password) {
      delete userData.password;
    }

    this.loading.show();
    this.isLoading.set(true);

    this.userService
      .updateUser(userId, userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.userData.set(updatedUser);
          this.updateLocalStorage(updatedUser);
          this.updateFormWithUserData(updatedUser);
          this.updateAvatar(updatedUser.name);
          this.authService.updateUser(updatedUser);
          this.loading.hide();
          this.isLoading.set(false);
          this.toast.openSuccess('Perfil atualizado com sucesso!');
          this.profileForm.get('password')?.reset();
          this.change_password.set(false);
        },
        error: (err) => {
          this.loading.hide();
          this.isLoading.set(false);
          console.error('Erro ao atualizar perfil:', err);
          this.toast.openSuccess('Erro ao atualizar o perfil');
        },
      });
  }

  private updateLocalStorage(user: User): void {
    try {
      const currentUserString = localStorage.getItem('user');
      let updatedUser = { ...user };

      if (currentUserString) {
        const currentUser = JSON.parse(currentUserString);
        updatedUser = { ...currentUser, ...user };
      }

      if (updatedUser.password) {
        delete updatedUser.password;
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar localStorage:', error);
    }
  }
}
