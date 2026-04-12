import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadingService } from './loading.service';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  imports: [MatProgressSpinnerModule],
})
export class LoadingComponent {
  manualLoading = input<boolean>(false);
  private loadingService = inject(LoadingService);

  private globalLoading = toSignal(this.loadingService.isLoading(), { initialValue: false });

  showLoading = computed(() => this.globalLoading() || this.manualLoading());
}
