import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from 'app/components/column/column.component';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { ValidationService } from 'app/services/validation/validation.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-spiritual-information',
  templateUrl: './spiritual-information.component.html',
  styleUrl: './spiritual-information.component.scss',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatIconModule,
    ColumnComponent,
    MatButtonModule,
  ],
})
export class SpiritualInformationComponent implements OnInit {
  @Input() stepThreeForm!: FormGroup;
  @Input() memberOrigins: MemberOrigin[] = [];
  @Input() searchControlMemberOrigins!: FormControl; // Ensure this is passed
  filterMemberOrigins: Observable<MemberOrigin[]> = new Observable<MemberOrigin[]>();
  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  @ViewChild('baptismPicker') baptismPicker!: MatDatepicker<Date>;
  @ViewChild('baptismHolySpiritPicker') baptismHolySpiritPicker!: MatDatepicker<Date>;
  @ViewChild('receiptDatePicker') receiptDatePicker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupAutocomplete();
  }

  initializeForm = () => {
    if (!this.stepThreeForm) {
      this.stepThreeForm = this.fb.group({
        baptism_date: [''],
        baptism_locale: ['', [Validators.maxLength(255)]],
        baptism_official: ['', [Validators.maxLength(255)]],
        baptism_holy_spirit: [false],
        baptism_holy_spirit_date: [''],
        member_origin_id: ['', [Validators.required]],
        receipt_date: [''],
      });
    }
  };

  setupAutocomplete() {
    this.filterMemberOrigins = this.searchControlMemberOrigins.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterMemberOrigin(name) : this.memberOrigins)),
    );
  }

  filterMemberOrigin(name: string): MemberOrigin[] {
    return this.memberOrigins.filter((origin) => origin.name.toLowerCase().includes(name.toLowerCase()));
  }

  onMemberOriginSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMemberOrigin = event.option.value;
    this.searchControlMemberOrigins.setValue(selectedMemberOrigin.name);
    this.stepThreeForm.get('member_origin_id')?.setValue(selectedMemberOrigin.id);
  }

  clearDate(fieldName: string) {
    this.stepThreeForm.get(fieldName)?.reset();
  }

  onCheckboxChange(fieldName: string, checkboxControlName: string) {
    const isChecked = this.stepThreeForm.get(checkboxControlName)?.value;
    if (!isChecked) {
      this.stepThreeForm.get(fieldName)?.reset(null);
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.stepThreeForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  openCalendarBaptismDate(): void {
    if (this.baptismPicker) {
      this.baptismPicker.open();
    }
  }

  openCalendarBaptismHolySpiritDate(): void {
    if (this.baptismHolySpiritPicker) {
      this.baptismHolySpiritPicker.open();
    }
  }

  openCalendarReceiptDate(): void {
    if (this.receiptDatePicker) {
      this.receiptDatePicker.open();
    }
  }

  showAllMemberOrigins() {
    this.filterMemberOrigins = this.searchControlMemberOrigins.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterMemberOrigin(name) : this.memberOrigins)),
    );
  }
}
