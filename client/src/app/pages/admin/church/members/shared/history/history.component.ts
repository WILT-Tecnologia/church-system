import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { History } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { NoRowComponent } from '../../../../../../components/no-row/no-row.component';
import { MemberService } from '../member.service';
import { HistoryService } from './history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    NoRowComponent,
  ],
})
export class HistoryComponent implements OnInit {
  @Input() history_member: History[] = [];
  rendering: boolean = true;

  constructor(
    private loadingService: LoadingService,
    private toast: ToastService,
    private historyService: HistoryService,
    private memberService: MemberService,
    private dialogRef: MatDialogRef<HistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { history_member: History },
  ) {}

  ngOnInit() {
    this.loadHistories();
  }

  showLoading() {
    this.loadingService.show();
  }

  hideLoading() {
    this.loadingService.hide();
  }

  loadHistories() {
    this.showLoading();
    const memberId = this.memberService.getEditingMemberId();
    this.historyService.findAll(memberId!).subscribe({
      next: (history_member) => {
        this.history_member = history_member;
        this.rendering = false;
      },
      error: () => {
        this.hideLoading();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  }
}
