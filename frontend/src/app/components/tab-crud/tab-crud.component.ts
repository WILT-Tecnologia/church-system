import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable } from 'rxjs';

import { ActionsProps, ColumnDefinitionsProps, CrudComponent } from '../crud/crud.component';
import { LoadingService } from '../loading/loading.service';
import { NotFoundRegisterComponent } from '../not-found-register/not-found-register.component';
import { MESSAGES } from '../toast/messages';
import { ToastService } from '../toast/toast.service';

export interface TabConfig {
  id: string;
  name: string;
  color?: string;
}

export interface CrudConfig {
  columnDefinitions: ColumnDefinitionsProps[];
  actions: ActionsProps[];
  addFn: () => void;
  editFn: (item: any) => void;
  deleteFn: (item: any) => void;
  toggleFn?: (item: any) => void;
  enableToggleStatus: boolean;
}

@Component({
  selector: 'app-tab-crud',
  templateUrl: './tab-crud.component.html',
  styleUrl: './tab-crud.component.scss',
  imports: [CommonModule, MatTabsModule, CrudComponent, NotFoundRegisterComponent],
})
export class TabCrudComponent implements OnInit {
  @Input() tabs: TabConfig[] = [];
  @Input() crudConfig!: CrudConfig;
  @Input() dataService!: (tabId: string) => Observable<any[]>;
  @Input() handleCreate!: () => void;

  selectedTabIndex = 0;
  dataSources: { [key: string]: any[] } = {};
  loading = false;

  constructor(
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.tabs.length > 0) {
      this.loadTabData(this.tabs[0].id);
    }
    this.cdr.detectChanges();
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    const tabId = this.tabs[index].id;
    if (!this.dataSources[tabId]) {
      this.loadTabData(tabId);
    }
  }

  loadTabData(tabId: string) {
    this.loading = true;
    this.loadingService.show();
    this.dataService(tabId).subscribe({
      next: (data) => {
        this.dataSources[tabId] = data;
        this.loading = false;
        this.loadingService.hide();
      },
      error: () => {
        this.loading = false;
        this.loadingService.hide();
        this.toastService.openError(MESSAGES.LOADING_ERROR);
      },
    });
  }
}
