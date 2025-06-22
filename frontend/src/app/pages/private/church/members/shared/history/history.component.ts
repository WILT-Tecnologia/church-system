import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from 'app/components/loading/loading.service';
import { NoRowComponent } from 'app/components/no-row/no-row.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { History } from 'app/model/Members';
import { MembersService } from '../../members.service';
import { HistoryService } from './history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [CommonModule, MatIconModule, MatDividerModule, MatButtonModule, NoRowComponent],
})
export class HistoryComponent implements OnInit {
  @Input() history_member: History[] = [];
  rendering: boolean = true;

  constructor(
    private loadingService: LoadingService,
    private toast: ToastService,
    private historyService: HistoryService,
    private membersService: MembersService,
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
    const memberId = this.membersService.getEditingMemberId();
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
