import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { AuthService } from 'app/services/auth/auth.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hide: boolean = true;
  change_password: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loading: LoadingService,
    private toast: ToastService,
    private authService: AuthService,
    private dialog: MatDialog,
    private validationService: ValidationService,
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm() {
    return (this.loginForm = this.fb.group({
      email: [
        'administrador@gmail.com',
        [Validators.required, Validators.email],
      ],
      password: [
        '@mpresaPC10',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
        ],
      ],
    }));
  }

  onSubmit() {
    this.showLoading();
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => this.handleLoginResponse(response),
        error: () => this.onError(MESSAGES.LOGIN_ERROR),
        complete: () => this.hideLoading(),
      });
    }
  }

  handleLoginResponse(response: any) {
    const { churches } = response;

    if (!churches || churches.length === 0) {
      this.onError('Nenhuma igreja encontrada');
      return;
    }

    localStorage.setItem('churches', JSON.stringify(churches));

    if (churches.length === 1) {
      this.navigateToChurch(churches[0]);
    } else if (churches.length > 1) {
      localStorage.removeItem('selectedChurch');
      this.router.navigate(['/select-church']);
    } else {
      this.onError('Nenhuma igreja encontrada para este usuário');
    }
  }

  navigateToChurch(church: Church): Promise<boolean> {
    localStorage.setItem('selectedChurch', church?.id);
    return this.router.navigate(['/church']);
  }

  getErrorMessage(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  showLoading() {
    this.loading.show();
  }

  hideLoading() {
    this.loading.hide();
  }

  toggleHide(): void {
    this.hide = !this.hide;
  }
}
