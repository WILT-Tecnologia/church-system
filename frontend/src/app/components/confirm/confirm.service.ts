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
   * @param reverseBtn inverte a ordem dos botoes
   * @param disableClose disabilita o fechamento clicando fora do modal
   * @param customClassContainer classe css no container
   */
  public openConfirm(
    title: string,
    message: string,
    btnOkText: string = 'Confirmar',
    btnCancelText: string = 'Cancelar',
    reverseBtn: boolean = false,
    disableClose: boolean = true,
    customClassContainer: string = '',
  ) {
    const isMobile = window.innerWidth <= 768;

    return this.dialog.open<ConfirmComponent>(ConfirmComponent, {
      minWidth: isMobile ? '95dvw' : '30dvw',
      maxWidth: isMobile ? '95dvw' : '30dvw',
      role: 'dialog',
      autoFocus: false,
      disableClose: disableClose,
      panelClass: customClassContainer ? customClassContainer : 'modal',
      data: {
        title,
        message,
        btnOkText,
        btnCancelText,
        reverseBtn,
        disableClose,
        customClassContainer,
      },
    });
  }
}
