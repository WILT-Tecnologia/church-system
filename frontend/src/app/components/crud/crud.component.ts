import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { ModalService } from '../modal/modal.service';
import { FilterButtonAdvancedComponent, FilterField } from './filter-button-advanced/filter-button-advanced.component';

export interface TableField {
  [key: string]: any;
}

export type ActionsProps = {
  type: string;
  tooltip?: string;
  icon?: string;
  label?: string;
  color?: 'primary' | 'accent' | 'warn';
  inactiveLabel?: string;
  activeLabel?: string;
  action: (element: any) => void;
};

export type ColumnDefinitionsProps = {
  key: string;
  header: string;
  type: string;
};

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
  ],
  providers: [FormatsPipe],
})
export class CrudComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() fields: TableField[] = [];
  @Input() ctaLabel!: string;
  @Input() columnDefinitions: ColumnDefinitionsProps[] = [];
  @Input() enableFilterAdvanced: boolean = false;
  @Input() enablePagination: boolean = true;
  @Input() enableToggleStatus: boolean = false;
  @Input() enableAddButtonAdd: boolean = true;
  @Input() enableRowClickDialog: boolean = false;
  @Input() modalTitle: string = 'Detalhes do Registro';
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
  @Input() modalComponent: Type<any> | null = null;
  @Input() applyFilterFn!: (event: any) => void;
  @Input() actionFn!: (element?: any) => void;
  @Input() addFn!: () => void;
  @Input() editFn!: (element: any) => void;
  @Input() deleteFn!: (element: any) => void;
  @Input() toggleFn!: (element: any) => void;
  @Input() findDataFn!: (element?: any) => void;
  @Output() page = new EventEmitter<Event>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [];
  currentPageIndex: number = 0;
  showFilter: boolean = false;
  buttonSelected = signal(false);
  columnWidths: { [key: string]: number } = {};

  constructor(
    private format: FormatsPipe,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.dataSourceMat.data = this.fields;
    this.displayedColumns = this.columnDefinitions.map((col) => col.key).concat('actions');
    this.dataSourceMat.filterPredicate = this.createFilter();
    this.columnDefinitions.forEach((col) => {
      this.columnWidths[col.key] = 150;
    });
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this.dataSourceMat.data = this.fields;
      // Process actions to handle dynamic labels (e.g., for toggle)
      this.actions = this.actions.map((action) => ({
        ...action,
        label: action.type === 'toggle' ? this.getToggleLabel(action) : action.label,
      }));
    }
    if (this.paginator) {
      this.dataSourceMat.paginator = this.paginator;
      this.paginator.length = this.fields.length;
    }

    if (changes['columnDefinitions']) {
      this.displayedColumns = this.columnDefinitions.map((col) => col.key).concat('actions');
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

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSourceMat.filterPredicate = this.createFilter();
    this.filterPredicate();
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

  createFilter(_filterValues: any = {}): (data: any, filter: string) => boolean {
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
          case 'dateRange':
            const dataDate = new Date(dataValue);
            const start = filterValue.start ? new Date(filterValue.start) : null;
            const end = filterValue.end ? new Date(filterValue.end) : null;
            return (!start || dataDate >= start) && (!end || dataDate <= end);
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

  toggleFilter = () => {
    this.showFilter = !this.showFilter;
    this.buttonSelected.update((prev) => !prev);
  };

  private getToggleLabel(action: ActionsProps): string {
    return action.inactiveLabel || 'Desativar';
  }

  private normalizeString(value: any): string {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private normalizedFilter(filter: any, data: any): boolean {
    const normalizedFilter = this.normalizeString(filter);
    return this.columnDefinitions.some((column) => {
      const value = this.format.getNestedValue(data, column.key);
      if (value !== null && value !== undefined) {
        const normalizedValue = this.normalizeString(value);
        return normalizedValue.includes(normalizedFilter);
      }
      return false;
    });
  }

  private filterPredicate() {
    this.dataSourceMat.filterPredicate = this.createFilter();
  }
}
