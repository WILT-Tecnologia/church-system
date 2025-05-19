import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  public openModal(
    id?: string,
    customContent?: any,
    title: string = '',
    isHandleClose: boolean = false,
    disableClose: boolean = true,
    data?: Record<string, any>,
    customClassContainer?: string | string[],
    enableFullscreen: boolean = false,
  ) {
    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;
    const panelClasses = Array.isArray(customClassContainer)
      ? [...customClassContainer, 'responsive-modal']
      : customClassContainer
        ? [customClassContainer, 'responsive-modal']
        : ['responsive-modal'];

    const dialogConfig: MatDialogConfig = {
      width: '60dvw',
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
        ...data,
      },
    };

    if (isMobile) {
      dialogConfig.width = '100dvw';
      dialogConfig.height = '100dvh';
    }

    return this.dialog.open<ModalComponent>(ModalComponent, dialogConfig);
  }
}
