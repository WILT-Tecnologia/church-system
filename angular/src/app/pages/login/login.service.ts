import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from 'app/service/core/core.service';
import { LoadingService } from '../../components/loading/loading.service';
import { AuthService } from '../../service/auth/auth.service';
import { SnackbarService } from '../../service/snackbar/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private core: CoreService,
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
    this.core.handleHome();
  }

  private handleLoginError(err: any) {
    if (err.status === 401) {
      this.snackbarService.openError('Login ou senha inválidos');
    } else {
      this.snackbarService.openError('Erro ao tentar realizar login');
    }
  }
}
