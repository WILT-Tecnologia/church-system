import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  Pipe,
  PipeTransform,
  signal,
  Type,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormatValuesPipe } from 'app/components/crud/pipes/format-values.pipe';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { AuthService } from 'app/services/auth/auth.service';
import { ModalService } from '../modal/modal.service';
import { NotFoundRegisterComponent } from '../not-found-register/not-found-register.component';
import { BadgeTypeComponent } from './shared/badge-type/badge-type.component';
import {
  FilterButtonAdvancedComponent,
  FilterField,
} from './shared/filter-button-advanced/filter-button-advanced.component';
import { ActionsProps, ColumnDefinitionsProps } from './types';

export interface TableField {
  [key: string]: any;
}

@Pipe({ name: 'hasNonToggleActions', standalone: true })
export class HasNonToggleActionsPipe implements PipeTransform {
  transform(actions: ActionsProps[]): boolean {
    return actions.some((action) => action.type !== 'toggle');
  }
}

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.scss',
  imports: [
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    CommonModule,
    FormatValuesPipe,
    HasNonToggleActionsPipe,
    FilterButtonAdvancedComponent,
    BadgeTypeComponent,
    NotFoundRegisterComponent,
  ],
  providers: [FormatsPipe],
})
export class CrudComponent implements OnInit, AfterViewInit {
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  fields = input<TableField[]>([]);
  ctaLabel = input<string>('Adicionar');
  columnDefinitions = input<ColumnDefinitionsProps[]>([]);
  enableFilterAdvanced = input<boolean>(false);
  enablePagination = input<boolean>(true);
  enableToggleStatus = input<boolean>(false);
  enableAddButtonAdd = input<boolean>(true);
  enableRowClickDialog = input<boolean>(false);
  tooltipText = input<string>('');
  length = input<string>('0');
  pageSize = input<number>(25);
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);
  template = input<string>('');
  sortColumn = input<string>('');
  sortDirection = input<SortDirection>('asc');
  isTooltip = input<boolean>(false);
  filterFields = input<FilterField[]>([]);
  actions = input<ActionsProps[]>([]);
  dataSourceMat = input<MatTableDataSource<any>>(new MatTableDataSource<any>([]));
  modalTitle = input<string>('Detalhes do Registro');
  modalComponent = input<Type<any> | null>(null);
  findDataLabel = input<string>('Atualizar');
  showFindDataButton = input<boolean>(false);
  readPermission = input<string | undefined>(undefined);
  writePermission = input<string | undefined>(undefined);
  deletePermission = input<string | undefined>(undefined);

  actionEvent = output<any>();
  add = output<void>();
  edit = output<any>();
  delete = output<any>();
  toggle = output<any>();
  findData = output<void>();
  page = output<Event>();

  displayedColumns = computed(() => {
    const cols = this.columnDefinitions().map((col) => col.key);
    if (this.canShowActions()) {
      cols.push('actions');
    }
    return cols;
  });

  currentPageIndex: number = 0;
  showFilter = signal(false);
  buttonSelected = signal(false);

  _canRead = computed(() => {
    const p = this.readPermission();
    return p ? this.authService.hasPermission(p) : false;
  });

  _canWrite = computed(() => {
    const p = this.writePermission();
    return p ? this.authService.hasPermission(p) : false;
  });

  _canDelete = computed(() => {
    const p = this.deletePermission();
    return p ? this.authService.hasPermission(p) : false;
  });

  canAddOrEdit = computed(() => this._canWrite());
  canDeleteRow = computed(() => this._canDelete());
  canRead = computed(() => this._canRead());

  canShowActions = computed(() => {
    const acts = this.actions();
    if (!acts || acts.length === 0) {
      return false;
    }
    const hasToggleAction = acts.some((action) => action.type === 'toggle');
    const hasPermission = this._canRead() || this._canWrite() || this._canDelete();
    return hasToggleAction || hasPermission;
  });

  tooltipLabel = computed(() => {
    const acts = this.actions();
    return acts && acts.length > 0 ? acts[0].tooltip || '' : '';
  });

  columnWidths: { [key: string]: number } = {};
  isResizing = false;
  currentResizeColumn: string | null = null;
  startX = 0;
  startWidth = 0;

  private hasSubscribedPaginator = false;

  constructor(
    private format: FormatsPipe,
    private modalService: ModalService,
    private authService: AuthService,
  ) {
    effect(() => {
      const p = this.paginator();
      if (p) {
        this.dataSourceMat().paginator = p;
        p.length = this.fields().length;
        if (!this.hasSubscribedPaginator) {
          p.pageIndex = this.currentPageIndex;
          p.page.subscribe(() => {
            this.currentPageIndex = p.pageIndex;
          });
          this.hasSubscribedPaginator = true;
        }
      }
    });

    effect(() => {
      const s = this.sort();
      if (s) {
        this.dataSourceMat().sort = s;
      }
    });

    effect(() => {
      this.dataSourceMat().data = this.fields();
    });
  }

  onResizeColumn(event: MouseEvent, columnKey: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.currentResizeColumn = columnKey;
    this.startX = event.pageX;

    const target = event.target as HTMLElement;
    const th = target.closest('th');
    this.startWidth = th ? th.offsetWidth : this.columnWidths[columnKey] || 150;

    const mouseMoveHandler = (e: MouseEvent) => {
      if (this.isResizing && this.currentResizeColumn) {
        const width = this.startWidth + (e.pageX - this.startX);
        this.columnWidths[this.currentResizeColumn] = width > 50 ? width : 50;
      }
    };

    const mouseUpHandler = () => {
      this.isResizing = false;
      this.currentResizeColumn = null;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  ngOnInit() {
    this.dataSourceMat().filterPredicate = this.createFilter();
  }

  ngAfterViewInit() {
    this.dataSourceMat().sortingDataAccessor = (item, property) => {
      const value = this.format.getNestedValue(item, property);
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        return this.normalizeString(value);
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
      if (value instanceof Date) {
        return value.getTime();
      }
      return value;
    };

    this.filterPredicate();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSourceMat().filterPredicate = this.createFilter();
    this.dataSourceMat().filter = filterValue;

    if (this.dataSourceMat().paginator) {
      this.dataSourceMat().paginator!.firstPage();
    }
  }

  applyAdvancedFilter(values: any) {
    if (Object.keys(values).length === 0) {
      this.dataSourceMat().filter = '';
      this.dataSourceMat().filterPredicate = this.createFilter();
      this.dataSourceMat().data = this.fields();
      if (this.dataSourceMat().paginator) {
        this.dataSourceMat().paginator!.firstPage();
      }
      return;
    }

    this.dataSourceMat().filterPredicate = this.createFilter(values);
    this.dataSourceMat().filter = JSON.stringify(values);

    if (this.dataSourceMat().paginator) {
      this.dataSourceMat().paginator!.firstPage();
    }
  }

  private createFilter(_filterValues: any = {}): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      if (!filter) {
        return true;
      }

      if (!filter.startsWith('{')) {
        const searchText = filter.toLowerCase();
        return this.columnDefinitions().some((col) => {
          const value = this.format.getNestedValue(data, col.key);
          return value != null && value.toString().toLowerCase().includes(searchText);
        });
      }

      let parsedFilterValues: any = {};
      try {
        parsedFilterValues = JSON.parse(filter);
      } catch (e) {
        console.error('Erro ao analisar filtro JSON:', e);
        return true;
      }

      if (Object.keys(parsedFilterValues).length === 0) {
        return true;
      }

      return Object.keys(parsedFilterValues).every((key) => {
        const filterValue = parsedFilterValues[key];
        const dataValue = this.format.getNestedValue(data, key);

        if (filterValue == null || dataValue == null) {
          return true;
        }

        const field = this.filterFields().find((f) => f.controlName === key);
        const fieldType = field?.type || 'text';

        switch (fieldType) {
          case 'select':
            if (Array.isArray(filterValue)) {
              return filterValue.length === 0 || filterValue.includes(dataValue);
            }
            return filterValue === dataValue;
          case 'text':
            return (
              filterValue.length === 0 || String(dataValue).toLowerCase().includes(String(filterValue).toLowerCase())
            );
          case 'number':
            if (Array.isArray(filterValue)) {
              return filterValue.length === 0 || filterValue.includes(Number(dataValue));
            }
            return Number(dataValue) === Number(filterValue);
          case 'boolean':
            if (Array.isArray(filterValue)) {
              return filterValue.length === 0 || filterValue.includes(Boolean(dataValue));
            }
            return Boolean(dataValue) === Boolean(filterValue);
          case 'date':
            return new Date(dataValue).toDateString() === new Date(filterValue).toDateString();
          case 'dateRange': {
            const dataDate = new Date(dataValue);
            const start = filterValue.start ? new Date(filterValue.start) : null;
            const end = filterValue.end ? new Date(filterValue.end) : null;
            return (!start || dataDate >= start) && (!end || dataDate <= end);
          }
          case 'range':
            return Number(dataValue) >= Number(filterValue);
          default:
            return true;
        }
      });
    };
  }

  openRowDialog(row: any): void {
    if (this.enableRowClickDialog() && this.modalComponent()) {
      this.modalService.openModal(
        `modal-${Math.random()}`,
        this.modalComponent()!,
        this.modalTitle(),
        true,
        true,
        {
          logCenter: row,
        },
        'custom-modal',
        true,
      );
    }
  }

  toggleFilter() {
    this.showFilter.update((value) => !value);
    this.buttonSelected.update((prev) => !prev);
  }

  action(element: any) {
    this.actionEvent.emit(element);
  }

  private normalizeString(value: any): string {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private filterPredicate() {
    this.dataSourceMat().filterPredicate = this.createFilter();
  }
}
