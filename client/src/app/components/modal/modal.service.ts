import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  /**
   * Modal para ser usado em toda a aplicação
   * @param id campo usado para identificar o modal
   * @param customContent Componente customizado para o conteudo do modal
   * @param title Titulo para o header do modal
   * @param isHandleClose Valor para habilitar ou desabilitar o botão de fechar no header
   * @param disableClose Desabilita o fechamento clicando fora do modal
   * @param data Dados do modal
   * @param customClassContainer Classe CSS para o container
   * @param enableFullscreen Habilita o botão de tela cheia
   * @returns
   */

  public openModal(
    id: string,
    customContent?: any,
    title: string = '',
    isHandleClose: boolean = false,
    disableClose: boolean = true,
    data?: {
      [key: string]: any;
    },
    customClassContainer: string | string[] = 'dialog',
    enableFullscreen: boolean = false,
  ) {
    const isMobile = window.innerWidth <= 768;

    return this.dialog.open<ModalComponent>(ModalComponent, {
      minWidth: isMobile ? '95vw' : '50dvw',
      maxWidth: isMobile ? '95vw' : '50dvw',
      minHeight: 'auto',
      maxHeight: isMobile ? '90vh' : '70dvh',
      role: 'dialog',
      autoFocus: false,
      disableClose: disableClose,
      panelClass: customClassContainer ? customClassContainer : 'modal',
      data: {
        id,
        customContent,
        title,
        isHandleClose,
        customClassContainer,
        enableFullscreen,
        ...data,
      },
    });
  }
}
