import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

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
    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
    const panelClasses = Array.isArray(customClassContainer)
      ? [...customClassContainer, 'responsive-modal']
      : customClassContainer
        ? [customClassContainer, 'responsive-modal']
        : ['responsive-modal'];

    const dialogConfig: MatDialogConfig = {
      width: '35dvw',
      maxWidth: '100dvw',
      maxHeight: '40dvh',
      role: 'dialog',
      autoFocus: false,
      disableClose: disableClose,
      panelClass: panelClasses,
      data: {
        title,
        message,
        btnOkText,
        btnCancelText,
        reverseBtn,
        disableClose,
        customClassContainer,
      },
    };

    if (isMobile) {
      dialogConfig.width = '100dvw';
      dialogConfig.height = '100dvh';
    }

    return this.dialog.open<ConfirmComponent>(ConfirmComponent, dialogConfig);
  }
}
