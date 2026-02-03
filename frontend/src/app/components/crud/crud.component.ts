import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  signal,
  SimpleChanges,
  Type,
  ViewChild,
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
  ],
  providers: [FormatsPipe],
})
export class CrudComponent implements OnInit, OnChanges, AfterViewInit {
  constructor(
    private format: FormatsPipe,
    private modalService: ModalService,
    private authService: AuthService,
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() fields: TableField[] = [];
  @Input() ctaLabel: string = 'Adicionar';
  @Input() columnDefinitions: ColumnDefinitionsProps[] = [];
  @Input() enableFilterAdvanced: boolean = false;
  @Input() enablePagination: boolean = true;
  @Input() enableToggleStatus: boolean = false;
  @Input() enableAddButtonAdd: boolean = true;
  @Input() enableRowClickDialog: boolean = false;
  @Input() tooltipText: string = '';
  @Input() length: string = '0';
  @Input() pageSize: number = 25;
  @Input() pageSizeOptions: number[] = [25, 50, 100, 200];
  @Input() template: string = '';
  @Input() sortColumn: string = '';
  @Input() sortDirection: SortDirection = 'asc';
  @Input() isTooltip?: boolean = false;
  @Input() filterFields: FilterField[] = [];
  @Input() actions!: ActionsProps[];
  @Input() dataSourceMat = new MatTableDataSource<any>([]);
  @Input() modalTitle: string = 'Detalhes do Registro';
  @Input() modalComponent: Type<any> | null = null;
  @Input() findDataLabel: string = 'Atualizar';
  @Input() showFindDataButton: boolean = false;
  @Input() readPermission?: string;
  @Input() writePermission?: string;
  @Input() deletePermission?: string;

  @Output() actionEvent = new EventEmitter<any>();
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<any>();
  @Output() findData = new EventEmitter<void>();
  @Output() page = new EventEmitter<Event>();

  displayedColumns: string[] = [];
  currentPageIndex: number = 0;
  showFilter = signal(false);
  buttonSelected = signal(false);
  private _canRead = false;
  private _canWrite = false;
  private _canDelete = false;

  ngOnInit() {
    this.dataSourceMat.data = this.fields;
    this.updatePermissions();
    this.updateDisplayedColumns();
    this.dataSourceMat.filterPredicate = this.createFilter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this.dataSourceMat.data = this.fields;
    }

    if (this.paginator) {
      this.dataSourceMat.paginator = this.paginator;
      this.paginator.length = this.fields.length;
    }

    if (changes['readPermission'] || changes['writePermission'] || changes['deletePermission']) {
      this.updatePermissions();
    }

    if (
      changes['columnDefinitions'] ||
      changes['actions'] ||
      changes['readPermission'] ||
      changes['writePermission'] ||
      changes['deletePermission']
    ) {
      this.updateDisplayedColumns();
    }
  }

  private updateDisplayedColumns() {
    this.displayedColumns = this.columnDefinitions.map((col) => col.key);
    if (this.canShowActions) {
      this.displayedColumns.push('actions');
    }
  }

  ngAfterViewInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;

    if (this.paginator) {
      this.paginator.pageIndex = this.currentPageIndex;
    }

    this.paginator?.page.subscribe(() => {
      this.currentPageIndex = this.paginator?.pageIndex;
    });

    this.dataSourceMat.sortingDataAccessor = (item, property) => {
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

  get tooltipLabel() {
    return this.actions && this.actions.length > 0 ? this.actions[0].tooltip : '';
  }

  private updatePermissions() {
    this._canRead = this.readPermission ? this.authService.hasPermission(this.readPermission) : this._canRead;
    this._canWrite = this.writePermission ? this.authService.hasPermission(this.writePermission) : this._canWrite;
    this._canDelete = this.deletePermission ? this.authService.hasPermission(this.deletePermission) : this._canDelete;
  }

  get canAddOrEdit(): boolean {
    return this._canWrite;
  }

  get canDeleteRow(): boolean {
    return this._canDelete;
  }

  get canRead(): boolean {
    return this._canRead;
  }

  get canShowActions(): boolean {
    if (!this.actions || this.actions.length === 0) {
      return false;
    }

    // Verifica se há ações do tipo toggle
    const hasToggleAction = this.actions.some((action) => action.type === 'toggle');

    // Verifica se o usuário tem pelo menos uma das permissões necessárias
    const hasPermission = this._canRead || this._canWrite || this._canDelete;

    // Mostra actions se houver toggle OU se tiver permissão
    return hasToggleAction || hasPermission;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSourceMat.filterPredicate = this.createFilter();
    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  applyAdvancedFilter(values: any) {
    if (Object.keys(values).length === 0) {
      this.dataSourceMat.filter = '';
      this.dataSourceMat.filterPredicate = this.createFilter();
      this.dataSourceMat.data = this.fields;
      if (this.dataSourceMat.paginator) {
        this.dataSourceMat.paginator.firstPage();
      }
      return;
    }

    this.dataSourceMat.filterPredicate = this.createFilter(values);
    this.dataSourceMat.filter = JSON.stringify(values);

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  private createFilter(_filterValues: any = {}): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      if (!filter) {
        return true;
      }

      if (!filter.startsWith('{')) {
        const searchText = filter.toLowerCase();
        return this.columnDefinitions.some((col) => {
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

        const field = this.filterFields.find((f) => f.controlName === key);
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
    if (this.enableRowClickDialog && this.modalComponent) {
      this.modalService.openModal(
        `modal-${Math.random()}`,
        this.modalComponent,
        this.modalTitle,
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
    this.dataSourceMat.filterPredicate = this.createFilter();
  }
}
