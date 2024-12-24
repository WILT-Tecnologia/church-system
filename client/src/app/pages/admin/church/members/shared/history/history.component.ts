import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
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
export class HistoryComponent {
  @Input() history: History[] = [
    {
      id: '1',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'members',
      before_situation: 'Ativo',
      after_situation: 'Inativo',
      change_date: '2024-12-01 10:30:00',
    },
    {
      id: '2',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'families',
      before_situation: 'Peixola',
      after_situation: 'Dan Dan',
      change_date: '2024-12-01 11:00:00',
    },
    {
      id: '3',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'members',
      before_situation: 'Ativo',
      after_situation: 'Inativo',
      change_date: '2024-12-01 10:30:00',
    },
    {
      id: '4',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'families',
      before_situation: 'Peixola',
      after_situation: 'Dan Dan',
      change_date: '2024-12-01 11:00:00',
    },
    {
      id: '5',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'members',
      before_situation: 'Ativo',
      after_situation: 'Inativo',
      change_date: '2024-12-01 10:30:00',
    },
    {
      id: '6',
      member_id: '9d83e18e-b15b-4c1f-9d41-54c1740b8c09',
      table_name: 'families',
      before_situation: 'Peixola',
      after_situation: 'Dan Dan',
      change_date: '2024-12-01 11:00:00',
    },
  ];
  rendering: boolean = true;

  constructor(
    private loadingService: LoadingService,
    private toast: ToastService,
    private historyService: HistoryService,
    private memberService: MemberService,
    private dialogRef: MatDialogRef<HistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: History },
  ) {}

  ngOnInit() {
    this.history;
    console.log(this.history);
    //this.loadHistories();
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
    this.historyService.getHistoryById(memberId!).subscribe({
      next: (history: History) => {
        this.history = [history];
        this.rendering = false;
      },
      error: () => {
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.hideLoading(),
    });
  }
}
