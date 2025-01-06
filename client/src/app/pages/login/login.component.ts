import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { AuthService } from 'app/services/auth/auth.service';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide: boolean = true;
  change_password: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loading: LoadingService,
    private toast: ToastService,
    private authService: AuthService,
    private validationService: ValidationService,
    private modal: ModalService,
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit() {}

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

  handleLoginResponse(response: any): void {
    const { churches } = response;

    localStorage.setItem('churches', JSON.stringify(churches));

    if (churches.length === 1) {
      this.navigateToChurch(churches[0]);
    } else if (churches.length > 1) {
      this.router.navigate(['/select-church']);
    }
  }

  navigateToChurch(church: Church): void {
    localStorage.setItem('selectedChurch', church?.id);
    this.router.navigate(['/church']);
  }

  getErrorMessage(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  onSuccess(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.router.navigateByUrl('/church');
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
