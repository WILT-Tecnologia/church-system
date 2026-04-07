import { inject, Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ModalAction, ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialog = inject(MatDialog);

  /**
   * Modal para ser usado em toda a aplicação
   * @param id Campo usado para identificar o modal
   * @param customContent Componente customizado para o conteúdo do modal
   * @param title Título para o header do modal
   * @param isHandleClose Habilita o botão de fechar no header
   * @param disableClose Desabilita o fechamento clicando fora do modal
   * @param data Dados extras do modal
   * @param customClassContainer Classe CSS para o container
   * @param enableFullscreen Habilita o botão de tela cheia
   * @param actions Lista de botões exibidos no rodapé do modal
   * @param width Adiciona uma largura ao modal
   * @param height Adiciona uma altura ao modal
   * @returns Referência do dialog aberto
   * @example
   * // Botão cancelar (warn) + botão salvar (primary)
   * this.modalService.openModal(
   *   'meu-modal',
   *   MeuComponent,
   *   'Título do Modal',
   *   true,
   *   true,
   *   {},
   *   undefined,
   *   false,
   *   [
   *     {
   *       label: 'Cancelar',
   *       type: 'stroked',
   *       color: 'warn',
   *       icon: 'close',
   *       onClick: (ref) => ref.close(),
   *     },
   *     {
   *       label: 'Salvar',
   *       type: 'flat',
   *       color: 'primary',
   *       icon: 'save',
   *       onClick: (ref) => { this.salvar(); ref.close(true); },
   *     },
   *   ],
   *   width: '500px',
   *   height: '500px',
   * );
   */
  public openModal(
    id?: string,
    customContent?: Type<any>,
    title: string = '',
    isHandleClose: boolean = false,
    disableClose: boolean = true,
    data?: Record<string, any>,
    customClassContainer?: string | string[],
    enableFullscreen: boolean = false,
    actions: ModalAction[] = [],
    width: string = 'auto',
    height: string = '50dvh',
  ) {
    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
    const panelClasses = Array.isArray(customClassContainer)
      ? [...customClassContainer, 'responsive-modal']
      : customClassContainer
        ? [customClassContainer, 'responsive-modal']
        : ['responsive-modal'];

    const dialogConfig: MatDialogConfig = {
      width: isMobile ? '100dvw' : width,
      height: isMobile ? '100dvh' : height,
      maxWidth: '100dvw',
      maxHeight: '90vh',
      role: 'dialog',
      autoFocus: false,
      disableClose: disableClose,
      panelClass: panelClasses,
      data: {
        id,
        customContent,
        title,
        isHandleClose,
        customClassContainer,
        enableFullscreen,
        actions,
        width,
        height,
        ...data,
      },
    };

    return this.dialog.open<ModalComponent>(ModalComponent, dialogConfig);
  }
}
