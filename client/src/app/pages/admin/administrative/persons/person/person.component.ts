import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { CommonModule } from '@angular/common';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Address } from 'app/model/Address';
import { Person } from 'app/model/Person';
import { CepService } from 'app/services/search-cep/search-cep.service';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { cpfValidator } from 'app/utils/validators/cpf-validator';
import { phoneValidator } from 'app/utils/validators/phone-validator';
import dayjs from 'dayjs';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ActionsComponent } from '../../../../../components/actions/actions.component';
import { PersonsService } from '../persons.service';

type Sex = {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-person',
  standalone: true,
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class PersonComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  personForm: FormGroup;
  personId: string | null = null;
  isEditMode: boolean = false;
  sexs: Sex[] = [
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Feminino' },
  ];
  private readonly _currentDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(this._currentDate);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private personService: PersonsService,
    private toast: ToastService,
    private cepService: CepService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<PersonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { person: Person },
  ) {
    this.personForm = this.createForm();
  }

  ngOnInit() {
    if (this.data && this.data?.person) {
      this.isEditMode = true;
      this.personId = this.data?.person?.id;
      this.personForm.patchValue(this.data.person);
      this.handleEditMode();
    }

    let previousCepValue = this.personForm.get('cep')?.value;

    this.personForm
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.person?.id || ''],
      user_id: [this.data?.person?.user_id || ''],
      image: [this.data?.person?.image || ''],
      name: [
        this.data?.person?.name || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      cpf: [
        this.data?.person?.cpf || '',
        [Validators.required, cpfValidator()],
      ],
      birth_date: [this.data?.person?.birth_date || '', [Validators.required]],
      email: [
        this.data?.person?.email || '',
        [Validators.required, Validators.email],
      ],
      phone_one: [
        this.data?.person?.phone_one || '',
        [Validators.required, phoneValidator()],
      ],
      phone_two: [this.data?.person?.phone_two || '', [phoneValidator()]],
      sex: [this.data?.person?.sex || '', [Validators.required]],
      cep: [this.data?.person?.cep || '', [Validators.required]],
      street: [
        this.data?.person?.street || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.person?.number || '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.person?.complement || '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.person?.district || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.person?.city || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.person?.state || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.person?.country || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      updated_at: [this.data?.person?.updated_at || ''],
    });
  };

  getErrorMessage(controlName: string): string | null {
    const control = this.personForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit = () => {
    if (this.personForm.invalid) {
      return;
    }

    const personData = this.personForm.value;
    this.isEditMode ? this.handleUpdate(personData.id) : this.handleCreate();
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  handleCreate = () => {
    this.loadingService.show();
    this.personService.createPerson(this.personForm.value).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(this.personForm.value);
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.CREATE_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  };

  handleUpdate = (personId: string) => {
    this.loadingService.show();
    this.personService
      .updatePerson(personId!, this.personForm.value)
      .subscribe({
        next: () => {
          this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
          this.dialogRef.close(this.personForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.toast.openError(MESSAGES.UPDATE_ERROR);
        },
        complete: () => this.loadingService.hide(),
      });
  };

  handleEditMode = () => {
    this.personService
      .getPersonById(this.personId!)
      .subscribe((person: Person) => {
        this.personForm.patchValue({
          ...person,
          updated_at: dayjs(person.updated_at).format('DD/MM/YYYY [às] HH:mm'),
        });
      });
  };

  clearDate() {
    this.personForm.get('birth_date')?.setValue(null);
  }

  openCalendar(): void {
    if (this.picker) {
      this.picker.open();
    }
  }

  searchCep(cep: string): void {
    if (this.personForm.get('cep')?.value?.length === '') {
      return;
    }

    this.cepService.searchCep(cep).subscribe({
      next: (data: Address) => {
        if (data) {
          this.personForm.patchValue({
            street: data.street || '',
            district: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
          });
        }
      },
      error: () => this.loadingService.hide(),
      complete: () => this.loadingService.hide(),
    });
  }
}
