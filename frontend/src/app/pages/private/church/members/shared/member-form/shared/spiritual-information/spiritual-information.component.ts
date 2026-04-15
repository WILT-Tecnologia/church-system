import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from '@app/components/column/column.component';
import { MemberOrigin } from '@app/model/MemberOrigins';
import { ErrorMessagePipe } from '@app/pipes/error-message.pipe';
import { ValidationService } from '@app/services/validation/validation.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-spiritual-information',
  templateUrl: './spiritual-information.component.html',
  styleUrl: './spiritual-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ErrorMessagePipe,
  ],
  providers: [provideNativeDateAdapter()],
})
export class SpiritualInformationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  public readonly stepThreeForm = input.required<FormGroup>();
  public readonly memberOrigins = input<MemberOrigin[]>([]);
  public readonly searchControlMemberOrigins = input.required<FormControl>();

  public filterMemberOrigins!: Observable<MemberOrigin[]>;
  public readonly minDate = new Date(1900, 0, 1);
  public readonly maxDate = new Date();

  @ViewChild('baptismPicker') baptismPicker!: MatDatepicker<Date>;
  @ViewChild('baptismHolySpiritPicker') baptismHolySpiritPicker!: MatDatepicker<Date>;
  @ViewChild('receiptDatePicker') receiptDatePicker!: MatDatepicker<Date>;

  ngOnInit() {
    this.setupAutocomplete();
  }

  setupAutocomplete() {
    this.filterMemberOrigins = this.searchControlMemberOrigins().valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterMemberOrigin(name) : this.memberOrigins())),
    );
  }

  filterMemberOrigin(name: string): MemberOrigin[] {
    return this.memberOrigins().filter((origin) =>
      origin.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  onMemberOriginSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMemberOrigin = event.option.value;
    this.searchControlMemberOrigins().setValue(selectedMemberOrigin.name);
    this.stepThreeForm().get('member_origin_id')?.setValue(selectedMemberOrigin.id);
  }

  clearDate(fieldName: string) {
    this.stepThreeForm().get(fieldName)?.reset();
  }

  onCheckboxChange(fieldName: string, checkboxControlName: string) {
    const isChecked = this.stepThreeForm().get(checkboxControlName)?.value;
    if (!isChecked) {
      this.stepThreeForm().get(fieldName)?.reset(null);
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.stepThreeForm().get(controlName);
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
    this.filterMemberOrigins = this.searchControlMemberOrigins().valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterMemberOrigin(name) : this.memberOrigins())),
    );
  }
}
