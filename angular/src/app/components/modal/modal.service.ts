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
   * @param actions Ações para o footer do modal em formato de array de objetos
   * @param disableClose Desabilita o fechamento clicando fora do modal
   * @param data Dados do modal
   * @param customClassContainer Classe CSS para o container
   * @returns
   */

  public openModal(
    id?: string,
    customContent?: any,
    title: string = '',
    isHandleClose: boolean = false,
    actions: {
      color: 'primary' | 'warn' | 'default';
      label: string;
      variant?:
        | 'mat-button'
        | 'mat-raised-button'
        | 'mat-flat-button'
        | 'mat-stroked-button'
        | 'mat-icon-button'
        | 'mat-fab'
        | 'mat-mini-fab';
      action: () => void;
    }[] = [
      {
        color: 'primary',
        label: 'Ok',
        variant: 'mat-raised-button',
        action: () => {},
      },
    ],
    disableClose: boolean = true,
    data?: {
      [key: string]: any;
    },
    customClassContainer?: string | string[],
  ) {
    return this.dialog.open(ModalComponent, {
      minWidth: '50dvw',
      maxWidth: '75dvw',
      minHeight: '50dvh',
      maxHeight: '75dvh',
      role: 'dialog',
      autoFocus: false,
      disableClose: disableClose,
      panelClass: customClassContainer ?? 'dialog',
      data: {
        id,
        customContent,
        title,
        isHandleClose,
        actions,
        customClassContainer,
        ...data,
      },
    });
  }
}
