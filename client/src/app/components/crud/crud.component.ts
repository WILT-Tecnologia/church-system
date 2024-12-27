import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';

export type ActionsProps = {
  type: string;
  tooltip?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  icon?: string;
  label?: string;
  action: (element: any) => void;
};

@Component({
  selector: 'app-crud',
  standalone: true,
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
  ],
})
export class CrudComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() fields: any[] = [];
  @Input() ctaLabel?: string;
  @Input() toggleFn!: (element: any) => void;
  @Input() deleteFn!: (element: any) => void;
  @Input() editFn!: (element: any) => void;
  @Input() addFn!: () => void;
  @Input() tooltipTextButtonToggleFn: string = '';
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() enablePagination: boolean = true;
  @Input() enableToggleStatus: boolean = false;
  @Input() enableAddButtonAdd: boolean = true;
  @Input() actions!: ActionsProps[];
  @Input() dataSourceMat = new MatTableDataSource<any>([]);
  @Input() columnDefinitions: { key: string; header: string; type: string }[] =
    [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [];
  currentPageIndex: number = 0;

  ngOnInit() {
    this.dataSourceMat.data = this.fields;
    this.displayedColumns = this.columnDefinitions
      .map((col) => col.key)
      .concat('actions');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields']) {
      this.dataSourceMat.data = this.fields;

      if (this.paginator) {
        this.dataSourceMat.paginator = this.paginator;
        this.paginator.length = this.fields.length;
      }
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
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSourceMat.filterPredicate = (data: any, filter: string) =>
      Object.values(data).some((value) =>
        String(value).toLowerCase().includes(filter),
      );

    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }
}
