import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from '@app/components/loading/loading.service';
import { NoRowComponent } from '@app/components/no-row/no-row.component';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { History } from '@app/model/Members';
import { MembersService } from '../../members.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatDividerModule, MatButtonModule, NoRowComponent],
})
export class HistoryComponent implements OnInit {
  public readonly history_member = signal<History[]>([]);
  private readonly loadingService = inject(LoadingService);
  private readonly toast = inject(ToastService);
  private readonly membersService = inject(MembersService);
  public readonly data = inject<{ history_member: History }>(MAT_DIALOG_DATA);

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
    if (memberId) {
      this.membersService.getHistMember(memberId).subscribe({
        next: (history_member) => {
          this.history_member.set(history_member);
        },
        error: () => {
          this.hideLoading();
          this.toast.openError(MESSAGES.LOADING_ERROR);
        },
        complete: () => this.hideLoading(),
      });
    } else {
      this.hideLoading();
    }
  }
}
