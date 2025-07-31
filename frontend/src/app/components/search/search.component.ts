import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';

import { TableField } from '../crud/crud.component';
import { FormatsPipe } from '../crud/pipes/formats.pipe';
import { ColumnDefinitionsProps } from '../crud/types';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, CommonModule],
  providers: [FormatsPipe],
})
export class SearchComponent {
  constructor(private format: FormatsPipe) {}
  @Input() fields: TableField[] = [];
  @Input() placeholder: string = 'Digite para pesquisar';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Output() searchChange = new EventEmitter<string>();
  columnDefinitions: ColumnDefinitionsProps[] = [];
  readonly dataSourceMat = new MatTableDataSource<any>(this.fields);

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.filterPredicate();

    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  private filterPredicate() {
    this.dataSourceMat.filterPredicate = (data: any, filter: string) => {
      return this.normalizedFilter(filter, data);
    };
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

  private normalizeString(value: any): string {
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
