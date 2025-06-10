import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from './toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  openSuccess(message: string, duration: number = 5000) {
    this.snackBar.openFromComponent(ToastComponent, {
      duration,
      data: { message, icon: 'done', action: 'Fechar' },
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success'],
    });
  }

  openError(message: string, duration: number = 5000) {
    this.snackBar.openFromComponent(ToastComponent, {
      duration,
      data: { message, icon: 'error', action: 'Fechar' },
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-error'],
    });
  }

  openWarning(message: string, duration: number = 5000) {
    this.snackBar.openFromComponent(ToastComponent, {
      duration,
      data: { message, icon: 'warning', action: 'Fechar' },
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-warning'],
    });
  }
}
