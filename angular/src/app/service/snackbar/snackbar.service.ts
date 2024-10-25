import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  openSuccess(
    message: string,
    action: string = 'Fechar',
    duration: number = 5000,
  ) {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success', 'custom-snackbar'],
    });
  }

  openError(
    message: string,
    action: string = 'Fechar',
    duration: number = 5000,
  ) {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-error', 'custom-snackbar'],
    });
  }
}
