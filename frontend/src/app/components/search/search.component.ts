import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class SearchComponent implements OnInit {
  constructor(private format: FormatsPipe) {}
  @Input() fields: TableField[] = [];
  @Input() placeholder: string = 'Digite para pesquisar';
  @Input() data: any[] = [];
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Output() searchChange = new EventEmitter<string>();
  columnDefinitions: ColumnDefinitionsProps[] = [];
  dataSourceMat = new MatTableDataSource<any>(this.fields);

  ngOnInit() {
    this.columnDefinitions = this.fields.map((field) => ({
      key: field['key'],
      header: field['header'],
      type: field['type'],
    }));

    this.dataSourceMat.data = this.data;

    this.dataSourceMat.filterPredicate = (data: any, filter: string) => {
      return this.normalizedFilter(filter, data);
    };
  }

  applyFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input?.value?.trim().toLowerCase() ?? '';

    this.dataSourceMat.filter = filterValue;
    this.searchChange.emit(filterValue); // Emit the filter value

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  private normalizedFilter(filter: string, data: any): boolean {
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
