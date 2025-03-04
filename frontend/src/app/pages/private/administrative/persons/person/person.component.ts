import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { ActionsComponent } from '../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { MESSAGES } from '../../../../../components/toast/messages';
import { ToastService } from '../../../../../components/toast/toast.service';
import { Address } from '../../../../../model/Address';
import { Person } from '../../../../../model/Person';
import { User } from '../../../../../model/User';
import { FormatsPipe } from '../../../../../pipes/formats.pipe';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { SanitizeValuesService } from '../../../../../services/sanitize/sanitize-values.service';
import { CepService } from '../../../../../services/search-cep/search-cep.service';
import { ValidationService } from '../../../../../services/validation/validation.service';
import { cpfValidator } from '../../../../../services/validators/cpf-validator';
import { phoneValidator } from '../../../../../services/validators/phone-validator';
import { UsersService } from '../../users/users.service';
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
    FormatsPipe,
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTabsModule,
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
  personForm: FormGroup;
  user: User[] = [];
  person: Person[] = [];
  isEditMode: boolean = false;
  searchUserControl = new FormControl('');
  filterUsers: Observable<User[]> = new Observable<User[]>();
  sexs: Sex[] = [
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Feminino' },
  ];
  private readonly _currentDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(this._currentDate);
  private destroy$ = new Subject<void>();
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(
    private fb: FormBuilder,
    private personService: PersonsService,
    private usersService: UsersService,
    private sanitize: SanitizeValuesService,
    private toast: ToastService,
    private cepService: CepService,
    private loading: LoadingService,
    private validationService: ValidationService,
    private notification: NotificationService,
    private formats: FormatsPipe,
    private dialogRef: MatDialogRef<PersonComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { person: Person },
  ) {
    this.personForm = this.createForm();
  }

  ngOnInit() {
    this.checkEditMode();
    this.loadUsers();
    this.filterUsers = this.searchUserControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) => (name.length >= 1 ? this._filterUsers(name) : this.user)),
    );
    this.initialSearchCep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data?.person?.id ?? ''],
      user_id: [
        this.data?.person?.user?.id ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      image: [this.data?.person?.image ?? ''],
      name: [
        this.data?.person?.name ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      cpf: [
        this.data?.person?.cpf ?? '',
        [Validators.required, cpfValidator()],
      ],
      birth_date: [this.data?.person?.birth_date ?? '', [Validators.required]],
      email: [
        this.data?.person?.email ?? '',
        [Validators.required, Validators.email],
      ],
      phone_one: [
        this.data?.person?.phone_one ?? '',
        [Validators.required, phoneValidator()],
      ],
      phone_two: [this.data?.person?.phone_two ?? '', [phoneValidator()]],
      sex: [this.data?.person?.sex ?? '', [Validators.required]],
      cep: [this.data?.person?.cep ?? '', [Validators.required]],
      street: [
        this.data?.person?.street ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.person?.number ?? '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.person?.complement ?? '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.person?.district ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.person?.city ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.person?.state ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.person?.country ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
    });
  };

  checkEditMode() {
    if (this.data?.person?.id) {
      this.isEditMode = true;

      if (this.data?.person?.user) {
        this.searchUserControl.setValue(this.data.person.user.name);
        this.personForm.get('user_id')?.setValue(this.data.person.user.id);
      }

      const birthDate = this.data.person.birth_date
        ? new Date(this.data.person.birth_date)
        : null;

      const sexValue = this.formats.SexTransform(
        this.data.person.sex,
        'toModel',
      );

      this.personForm.patchValue({
        birth_date: birthDate,
        sex: sexValue,
      });
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.personForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  clearDate() {
    this.personForm.get('birth_date')?.setValue(null);
  }

  openCalendar(): void {
    if (this.picker) {
      this.picker.open();
    }
  }

  showAllUsers() {
    this.filterUsers = this.searchUserControl.valueChanges.pipe(
      debounceTime(300),
      startWith(this.searchUserControl.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) => (name.length >= 1 ? this._filterUsers(name) : this.user)),
    );
  }

  loadUsers = () => {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  private _filterUsers(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.user.filter((user) =>
      user.name.toLowerCase().includes(filterValue),
    );
  }

  onUserSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value;
    this.searchUserControl.setValue(user.name);
    this.personForm.get('user_id')?.setValue(user.id);
  }

  initialSearchCep() {
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

  handleSubmit = () => {
    const person = this.personForm.value;

    if (!person) {
      return;
    }

    const personDataSanitized = {
      ...this.sanitize.sanitizeInput(person),
      sex: this.personForm.get('sex')?.value,
    };

    if (this.isEditMode) {
      this.handleUpdate(personDataSanitized.id, personDataSanitized);
    } else {
      this.handleCreate(personDataSanitized);
    }
  };

  handleCreate = (data: any) => {
    this.loading.show();
    this.personService.createPerson(data).subscribe({
      next: () =>
        this.notification.onSuccess(
          MESSAGES.CREATE_SUCCESS,
          this.dialogRef,
          this.personForm.value,
        ),
      error: (error) =>
        this.notification.onError(error.error.message ?? MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (personId: string, data: any) => {
    this.loading.show();
    this.personService.updatePerson(personId, data).subscribe({
      next: () =>
        this.notification.onSuccess(
          MESSAGES.UPDATE_SUCCESS,
          this.dialogRef,
          this.personForm.value,
        ),
      error: (error) =>
        this.notification.onError(error.error.message ?? MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  };
}
