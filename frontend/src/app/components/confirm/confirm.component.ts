import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { ActionsComponent } from '../actions/actions.component';

type DataProps = {
  title: string;
  message: string;
  btnOkText: string;
  btnCancelText: string;
  reverseBtn: boolean;
  disableClose: boolean;
  customClassContainer: string;
};

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatDividerModule, MatDialogModule, CommonModule, ActionsComponent],
})
export class ConfirmComponent implements OnInit, AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DataProps,
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

  closeModal() {
    this.dialogRef.close();
  }
}
