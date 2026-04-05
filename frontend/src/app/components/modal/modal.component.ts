import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ModalActionType = 'basic' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab' | 'extended-fab';
export type ModalActionColor = 'primary' | 'accent' | 'warn';

export interface ModalAction {
  label: string;
  type: ModalActionType;
  color?: ModalActionColor;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  onClick: (dialogRef: MatDialogRef<ModalComponent>) => void;
}

type ModalProps = {
  title?: string;
  isHandleClose?: boolean;
  enableFullscreen?: boolean;
  customContent?: any;
  actions?: ModalAction[];
};

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  imports: [
    MatCardModule,
    MatTooltipModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    CommonModule,
  ],
})
export class ModalComponent implements OnInit, AfterViewInit {
  isFullscreen: boolean = false;

  @ViewChild('customContent', { static: false }) customContent: any;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalProps,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const dialogContainer = document.querySelector('.mat-dialog-container') as HTMLElement;
      if (dialogContainer) {
        this.dialogRef.updatePosition();
        this.cdr.detectChanges();
      }
    }, 0);
  }

  closeModal = (): void => {
    this.dialogRef.close();
  };

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;

    if (this.customContent && this.customContent.onFullscreenChange) {
      this.customContent.onFullscreenChange(this.isFullscreen);
    }

    this.cdr.detectChanges();
  }

  handleAction(action: ModalAction): void {
    action.onClick(this.dialogRef);
  }
}
