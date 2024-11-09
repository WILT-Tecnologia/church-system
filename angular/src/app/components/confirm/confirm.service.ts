import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from './confirm.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private dialog: MatDialog) {}

  /**
   * Popup de confirmação
   * @param title titulo do confirm
   * @param message menssagem do confirm
   * @param btnOkText botão de confirmação
   * @param btnCancelText botão de cancelamento
   * @param disableClose disabilita o fechamento clicando fora do modal
   * @param customClassContainer classe css no container
   */
  public openConfirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancelar',
    reverseBtn: boolean = false,
    disableClose: boolean = true,
    customClassContainer: string = '',
  ) {
    return this.dialog.open(ConfirmComponent, {
      maxWidth: '100%',
      width: 'auto',
      height: 'auto',
      minHeight: 'auto',
      maxHeight: '100dvh',
      autoFocus: false,
      panelClass: 'dialog',
      data: {
        title,
        message,
        btnOkText,
        btnCancelText,
        reverseBtn,
        customClassContainer,
      },
      disableClose,
    });
  }

  /**
   * Popup de configuracoes pendentes
   * @param title titulo do confirm
   * @param message menssagem do confirm
   * @param btnOkText botão de confirmação
   */
  public openSettingsPending(
    title: string,
    message: string,
    btnOkText: string = 'OK',
  ) {
    return this.dialog.open(ConfirmComponent, {
      maxWidth: '100%',
      width: 'auto',
      height: 'auto',
      minHeight: 'auto',
      maxHeight: '100dvh',
      autoFocus: false,
      panelClass: 'dialog',
      data: {
        title,
        message,
        btnOkText,
      },
      disableClose: true,
    });
  }
}
