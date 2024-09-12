import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingService } from 'app/components/loading/loading.service';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar, private loading: LoadingService) {}

  openSuccess(
    message: string,
    action: string = 'Fechar',
    duration: number = 5000
  ) {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['snackbar-success', 'custom-snackbar'],
    });
  }

  openError(
    message: string,
    action: string = 'Fechar',
    duration: number = 5000
  ) {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['snackbar-error', 'custom-snackbar'],
    });
  }
}
