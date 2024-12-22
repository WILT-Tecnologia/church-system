import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'app/components/toast/toast.service';
import { LoadingService } from '../../components/loading/loading.service';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private loading: LoadingService,
    private router: Router,
  ) {}

  login(credentials: { login: string; password: string }) {
    this.loading.show();
    this.authService.login(credentials).subscribe({
      next: (result) => {
        this.handleLoginSuccess(result);
      },
      error: (err) => {
        this.loading.hide();
        this.handleLoginError(err);
      },
      complete: () => {
        this.loading.hide();
      },
    });
  }

  private handleLoginSuccess(result: any) {
    this.authService.storeUserData(result.access_token, result.user);
    this.router.navigateByUrl('/');
  }

  private handleLoginError(err: any) {
    if (err.status === 401) {
      this.toast.openError('Login ou senha inválidos');
    } else {
      this.toast.openError('Erro ao tentar realizar login');
    }
  }
}
