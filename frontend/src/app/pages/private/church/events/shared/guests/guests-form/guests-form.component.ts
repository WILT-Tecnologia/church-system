import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../../../components/column/column.component';
import { LoadingService } from '../../../../../../../components/loading/loading.service';
import { MESSAGES } from '../../../../../../../components/toast/messages';
import { Address } from '../../../../../../../model/Address';
import { Guest } from '../../../../../../../model/Events';
import { FormatsPipe } from '../../../../../../../pipes/formats.pipe';
import { NotificationService } from '../../../../../../../services/notification/notification.service';
import { CepService } from '../../../../../../../services/search-cep/search-cep.service';
import { ValidationService } from '../../../../../../../services/validation/validation.service';
import { phoneValidator } from '../../../../../../../services/validators/phone-validator';
import { GuestsService } from '../guests.service';

@Component({
  selector: 'app-guests-form',
  standalone: true,
  templateUrl: './guests-form.component.html',
  styleUrl: './guests-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatIconModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
    FormatsPipe,
  ],
})
export class GuestsFormComponent implements OnInit, OnDestroy {
  guestForm: FormGroup;
  guest: Guest[] = [];
  isEditMode: boolean = false;

  private readonly _currentDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(this._currentDate);
  private destroy$ = new Subject<void>();
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(
    private fb: FormBuilder,
    private guestsService: GuestsService,
    private cepService: CepService,
    private loading: LoadingService,
    private validationService: ValidationService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<GuestsFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { guest: Guest },
  ) {
    this.guestForm = this.createForm();
  }

  ngOnInit() {
    this.checkEditMode();
    this.initialSearchCep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data?.guest?.id ?? ''],
      name: [
        this.data?.guest?.name ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      phone_one: [
        this.data?.guest?.phone_one ?? '',
        [Validators.required, phoneValidator()],
      ],
      phone_two: [this.data?.guest?.phone_two ?? '', [phoneValidator()]],
      cep: [this.data?.guest?.cep ?? '', [Validators.required]],
      street: [
        this.data?.guest?.street ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.guest?.number ?? '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.guest?.complement ?? '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.guest?.district ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.guest?.city ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.guest?.state ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.guest?.country ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
    });
  };

  checkEditMode() {
    if (this.data?.guest?.id) {
      this.isEditMode = true;
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.guestForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  initialSearchCep() {
    let previousCepValue = this.guestForm.get('cep')?.value;

    this.guestForm
      .get('cep')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((cep: string) => {
        if (cep.length === 8 && cep !== previousCepValue) {
          this.searchCep(cep);
        }
        previousCepValue = cep;
      });
  }

  searchCep(cep: string): void {
    if (this.guestForm.get('cep')?.value?.length === '') {
      return;
    }

    this.cepService.searchCep(cep).subscribe({
      next: (data: Address) => {
        if (data) {
          this.guestForm.patchValue({
            street: data.street || '',
            district: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
          });
        }
      },
      error: () => this.loading.hide(),
      complete: () => this.loading.hide(),
    });
  }

  handleNext = () => {
    this.tabGroup.selectedIndex = 1;
  };

  handleBack = () => {
    this.tabGroup.selectedIndex = 0;
  };

  handleCancel() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const guest = this.guestForm;

    if (this.isEditMode && guest.valid) {
      this.handleUpdate(this.data?.guest?.id, guest.value);
    } else {
      this.handleCreate(guest.value);
    }
  }

  handleCreate = (data: any) => {
    this.loading.show();
    this.guestsService.create(data).subscribe({
      next: (guest) => {
        console.log(guest);
        this.notification.onSuccess(
          MESSAGES.CREATE_SUCCESS,
          this.dialogRef,
          this.guestForm.value,
        );
        this.dialogRef.close(guest);
      },
      error: (err) =>
        this.notification.onError(err.error.message ?? MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (id: string, data: any) => {
    this.loading.show();
    this.guestsService.update(id, data).subscribe({
      next: (guest) => {
        this.loading.hide();
        this.notification.onSuccess(
          MESSAGES.UPDATE_SUCCESS,
          this.dialogRef,
          this.guestForm.value,
        );
        this.dialogRef.close(guest);
      },
      error: (err) =>
        this.notification.onError(err.error.message ?? MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };
}
