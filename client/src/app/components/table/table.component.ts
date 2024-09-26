import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    CommonModule,
  ],
})
export class TableComponent<T> implements OnInit, AfterViewInit, OnChanges {
  @Input() dataSource: T[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() columnDefinitions: { [key: string]: string } = {};
  @Input() ctaLabel?: string;
  @Input() sortColumn: string = '';
  @Input() sortDirection: SortDirection = 'asc';
  @Input() isTooltip?: boolean = false;
  @Input() editFn!: (element: T) => void;
  @Input() deleteFn!: (element: T) => void;
  @Input() ctaFn?: () => void;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChildren('headerCells') headerCells!: QueryList<ElementRef>;

  dataSourceMat = new MatTableDataSource<T>();

  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;

  ngOnInit() {
    this.dataSourceMat = new MatTableDataSource(this.dataSource);
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      this.dataSourceMat.data = this.dataSource;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.sort.active = this.sortColumn;
        this.sort.direction = this.sortDirection;
        this.sort.sortChange.emit();
      }
    });
  }

  initializeTableDataSource() {
    this.dataSourceMat.data = this.dataSource;
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const normalizedFilterValue = filterValue
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    this.dataSourceMat.filter = normalizedFilterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  onPageSizeChange(event: any) {
    const pageSize = event.value;
    this.pageSize = pageSize;
    if (this.paginator) {
      this.paginator.pageSize = pageSize;
      this.dataSourceMat.paginator!.pageSize = pageSize;
    }
  }
}
