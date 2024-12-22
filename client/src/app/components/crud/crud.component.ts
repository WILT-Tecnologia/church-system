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
  /**
   * @param fields: Objeto que recebe os campos que serão exibidos na tabela
   * @param ctaLabel: Label do botão de adicionar
   * @param toggleFn: Função que altera o status do toggle
   * @param deleteFn: Função que deleta o item
   * @param editFn: Função que edita o item
   * @param addFn: Função que adiciona o item
   * @param tooltipTextButtonToggleFn: Texto do tooltip do botão de toggle
   * @param pageSizeOptions: Tamanho da paginacao
   * @param pageSize: Tamanho da paginacao
   * @param enableToggleStatus: Habilita o toggle de status
   * @param enableAddButtonAdd: Habilita o botão de adicionar
   * @param dataSourceMat: Dados da tabela
   * @param columnDefinitions: Colunas da tabela
   * @returns
   */
  @Input() fields: any[] = [];
  @Input() ctaLabel?: string;
  @Input() toggleFn!: (element: any) => void;
  @Input() deleteFn!: (element: any) => void;
  @Input() editFn!: (element: any) => void;
  @Input() addFn!: () => void;
  @Input() tooltipTextButtonToggleFn: string = '';
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() pageSize: number = 10;
  @Input() enableToggleStatus: boolean = false;
  @Input() enableAddButtonAdd: boolean = true;
  @Input() dataSourceMat = new MatTableDataSource<any>([]);
  @Input() columnDefinitions: { key: string; header: string; type: string }[] =
    [];
  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['columnDefinitions'] &&
      changes['columnDefinitions'].currentValue
    ) {
      this.displayedColumns = this.columnDefinitions
        .map((col) => col.key)
        .concat('actions');
    }

    if (changes['fields'] && changes['fields'].currentValue) {
      this.dataSourceMat.data = this.fields;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSourceMat.paginator = this.paginator;
      this.dataSourceMat.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSourceMat.filterPredicate = (data: any, filter: string) => {
      return this.searchInObject(data, filter);
    };

    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  searchInObject(obj: any, searchText: string): boolean {
    return Object.values(obj).some((value) => {
      if (typeof value === 'object' && value !== null) {
        return this.searchInObject(value, searchText);
      }
      return String(value).toLowerCase().includes(searchText);
    });
  }
}
