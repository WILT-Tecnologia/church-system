import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable } from 'rxjs';

import { CrudConfig, TabConfig } from './types';

import { CrudComponent } from '../crud/crud.component';
import { LoadingService } from '../loading/loading.service';
import { NotFoundRegisterComponent } from '../not-found-register/not-found-register.component';
import { MESSAGES } from '../toast/messages';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-tab-crud',
  templateUrl: './tab-crud.component.html',
  styleUrl: './tab-crud.component.scss',
  imports: [CommonModule, MatTabsModule, CrudComponent, NotFoundRegisterComponent],
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
