import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { NgForOf, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  imports: [
    //MatFormFieldModule,
    MatInputModule,
    MatIconButton,
    NgIf,
    MatButton,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
    {
      provide: MatFormFieldControl,
      useExisting: forwardRef(() => TimePickerComponent),
    },
  ],
})
export class TimePickerComponent
  implements ControlValueAccessor, MatFormFieldControl<string>, OnDestroy
{
  static nextId = 0;
  @ViewChild('hourInput') hourInput!: MatInput;
  @ViewChild('minuteInput') minuteInput!: MatInput;

  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'app-time-picker';
  id = `app-time-picker-${TimePickerComponent.nextId++}`;

  time: { hour: string; minute: string; period: 'AM' | 'PM' } = {
    hour: '12',
    minute: '00',
    period: 'AM',
  };

  showPicker = false;
  isHourView = true;

  private _required = false;
  private _disabled = false;
  private _placeholder = '';

  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    return !this.time.hour && !this.time.minute;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  get value(): string | null {
    return this.time.hour + ':' + this.time.minute + ' ' + this.time.period;
  }

  set value(value: string | null) {
    if (value) {
      const [hour, minute, period] = value.split(':');
      this.time.hour = hour;
      this.time.minute = minute;
      // @ts-ignore
      this.time.period = period;
    } else {
      this.time.hour = '12';
      this.time.minute = '00';
      this.time.period = 'AM';
    }
  }

  constructor(
    private elementRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  setDescribedByIds(ids: string[]): void {}

  onContainerClick(event: MouseEvent): void {
    if (!this.showPicker) {
      this.togglePicker();
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private updateErrorState() {
    const oldState = this.errorState;
    const newState = !!this.ngControl?.invalid && !!this.ngControl?.touched;
    if (oldState !== newState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }

  // Modifique o updateModel para incluir validação

  writeValue(value: any): void {
    if (value) {
      const [time, period] = value.split(' ');
      const [hour, minute] = time.split(':');
      this.time = {
        hour: period === 'PM' ? this.convertTo12Hour(hour) : hour,
        minute,
        period: period as 'AM' | 'PM',
      };
    } else {
      this.time = { hour: '12', minute: '00', period: 'AM' };
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  togglePicker(): void {
    this.showPicker = !this.showPicker;
    this.isHourView = true;
  }

  selectHour(hour: string): void {
    this.time.hour = hour;
    this.isHourView = false;
  }

  selectMinute(minute: string): void {
    this.time.minute = minute.padStart(2, '0');
    this.showPicker = false;
    this.updateModel();
  }

  togglePeriod(): void {
    this.time.period = this.time.period === 'AM' ? 'PM' : 'AM';
    this.updateModel();
  }

  private updateModel(): void {
    const hour24 =
      this.time.period === 'PM'
        ? this.convertTo24Hour(this.time.hour)
        : this.time.hour;

    const value = `${hour24}:${this.time.minute} ${this.time.period}`;
    this.onChange(value);
    this.onTouched();
    this.updateErrorState();
  }

  private convertTo24Hour(hour: string): string {
    const numericHour = parseInt(hour, 10);
    return this.time.period === 'PM'
      ? String(numericHour === 12 ? 12 : numericHour + 12).padStart(2, '0')
      : String(numericHour === 12 ? 0 : numericHour).padStart(2, '0');
  }

  private convertTo12Hour(hour: string): string {
    const numericHour = parseInt(hour, 10);
    return String(numericHour > 12 ? numericHour - 12 : numericHour);
  }

  get numbers(): string[] {
    return this.isHourView
      ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
      : Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPicker = false;
    }
  }
}
