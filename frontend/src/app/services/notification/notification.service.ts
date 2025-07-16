import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private loading: LoadingService,
    private toast: ToastService,
  ) {}

  onSuccess<T>(message: string, dialogRef?: MatDialogRef<any>, formValue?: T): void {
    this.loading.hide();
    this.toast.openSuccess(message);
    dialogRef?.close(formValue);
  }

  onError(message: string): void {
    this.loading.hide();
    this.toast.openError(message);
  }
}
