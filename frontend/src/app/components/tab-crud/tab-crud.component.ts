import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable } from 'rxjs';
import { CrudComponent } from '../crud/crud.component';
import { LoadingService } from '../loading/loading.service';
import { MESSAGES } from '../toast/messages';
import { ToastService } from '../toast/toast.service';
import { CrudConfig, TabConfig } from './types';

@Component({
  selector: 'app-tab-crud',
  templateUrl: './tab-crud.component.html',
  styleUrl: './tab-crud.component.scss',
  imports: [CommonModule, MatTabsModule, CrudComponent, MatButtonModule, MatIconModule],
})
export class TabCrudComponent implements OnInit {
  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  @Input() tabs: TabConfig[] = [];
  @Input() crudConfig!: CrudConfig;
  @Input() dataService!: (tabId: string) => Observable<any[]>;
  @Output() addFn = new EventEmitter<void>();
  enableAddButtonAdd = input<boolean>(true);
  ctaLabel = input<string>('Adicionar');
  add = output<void>();
  selectedTabIndex = signal(0);
  dataSources = signal<{ [key: string]: any[] }>({});
  loading = signal(false);

  ngOnInit() {
    if (this.tabs.length > 0) {
      this.loadTabData(this.tabs[0].id);
    }
    this.cdr.detectChanges();
  }

  onTabChange(index: number) {
    this.selectedTabIndex.set(index);
    const tabId = this.tabs[index].id;
    if (!this.dataSources()[tabId]) {
      this.loadTabData(tabId);
    }
  }

  loadTabData(tabId: string) {
    if (this.dataSources()[tabId]) {
      this.loading.set(false);
      this.loadingService.hide();
      this.cdr.detectChanges();
      return;
    }
    this.loading.set(true);
    this.loadingService.show();
    this.dataService(tabId).subscribe({
      next: (data) => {
        this.dataSources.update((sources) => ({
          ...sources,
          [tabId]: data,
        }));
        this.loading.set(false);
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.set(false);
        this.loadingService.hide();
        this.toastService.openError(MESSAGES.LOADING_ERROR);
        this.cdr.detectChanges();
      },
    });
  }
}
