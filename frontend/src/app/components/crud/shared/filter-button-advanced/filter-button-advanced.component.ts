import { CommonModule } from '@angular/common';
import { Component, effect, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, Observable, startWith } from 'rxjs';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

export interface FilterField {
  label: string;
  placeholder?: string;
  controlName: string;
  type?: 'select' | 'dateRange' | 'range' | 'number' | 'boolean' | 'date';
  options?: { value: any; label: any }[];
  searchCtrl?: FormControl;
  filteredOptions?: Observable<{ value: any; label: any }[]>;
  onFilterChange?: (fieldName: string, selectedValue: any) => void;
}

@Component({
  selector: 'app-filter-button-advanced',
  templateUrl: './filter-button-advanced.component.html',
  styleUrl: './filter-button-advanced.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSliderModule,
    FormsModule,
    NgxMatSelectSearchModule,
  ],
})
export class FilterButtonAdvancedComponent implements OnInit {
  fields = input<FilterField[]>([]);
  applyFilter = input<any>();
  filterChange = output<any>();
  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      dateRange: [''],
      select: [''],
      range: [''],
      client: [''],
      portal: [''],
      selective_process: [''],
      stage: [''],
      step: [''],
      component: [''],
      duration: [0],
    });

    effect(() => {
      const currentFields = this.fields();
      this.initializeFormControls(currentFields);
    });
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe((values) => {
      this.filterChange.emit(values);
    });
  }

  formatLabel(value: number): string {
    return Math.round(value) + 's';
  }

  onSliderChange(event: any) {
    const value = event.value;
    this.filterForm.get('duration')?.setValue(value);
  }

  isAllSelected(controlName: string): boolean {
    const control = this.filterForm.get(controlName);
    if (!control) return false;

    const field = this.fields().find((field) => field.controlName === controlName);
    if (!field || !field.options) return false;

    return control.value && control.value.length === field.options.length;
  }

  toggleAllSelection(controlName: string): void {
    const control = this.filterForm.get(controlName);
    const field = this.fields().find((field) => field.controlName === controlName);
    if (control && field && field.options) {
      if (this.isAllSelected(controlName)) {
        control.setValue([]);
      } else {
        control.setValue(field.options.map((option) => option.value));
      }
    }
  }

  isIndeterminate(controlName: string): boolean {
    const control = this.filterForm.get(controlName);
    const field = this.fields().find((field) => field.controlName === controlName);
    if (!control || !field || !field.options) return false;

    return control.value && control.value.length > 0 && control.value.length < field.options.length;
  }

  private initializeFormControls(fieldsConfig: FilterField[]) {
    // Preserve current main form object, just add controls dynamically
    fieldsConfig.forEach((field) => {
      if (!this.filterForm.contains(field.controlName)) {
        this.filterForm.addControl(field.controlName, this.fb.control([]));
      }

      if (field.type === 'select') {
        this.setupSelectField(field);
      }
    });
  }

  private setupSelectField(field: FilterField) {
    if (!field.searchCtrl) {
      field.searchCtrl = new FormControl('');
      field.filteredOptions = field.searchCtrl.valueChanges.pipe(
        startWith(''),
        map((search) =>
          (field.options || []).filter((option) => option.label.toLowerCase().includes(search.toLowerCase())),
        ),
      );
    }
  }
}
