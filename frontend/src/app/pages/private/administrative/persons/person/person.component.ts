import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Address } from 'app/model/Address';
import { Person } from 'app/model/Person';
import { User } from 'app/model/User';
import { NotificationService } from 'app/services/notification/notification.service';
import { SanitizeValuesService } from 'app/services/sanitize/sanitize-values.service';
import { CepService } from 'app/services/search-cep/search-cep.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { cpfValidator } from 'app/services/validators/cpf-validator';
import { phoneValidator } from 'app/services/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UsersService } from '../../users/users.service';
import { PersonsService } from '../persons.service';

type Sex = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-person',
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
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
    NgxMaskDirective,
  ],
})
export class PersonComponent implements OnInit, OnDestroy {
  private user: User[] = [];
  private readonly currentDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(this.currentDate);
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private personService = inject(PersonsService);
  private usersService = inject(UsersService);
  private validationService = inject(ValidationService);
  private notificationService = inject(NotificationService);
  private sanitizeService = inject(SanitizeValuesService);
  private toastService = inject(ToastService);
  private cepService = inject(CepService);
  private loadingService = inject(LoadingService);
  private formatsPipe = inject(FormatsPipe);
  private dialogRef = inject(MatDialogRef<PersonComponent>);
  private data = inject(MAT_DIALOG_DATA);
  personForm!: FormGroup;
  isEditMode = signal(false);
  searchUserControl = new FormControl('');
  filterUsers: Observable<User[]> = new Observable<User[]>();
  picker = viewChild(MatDatepicker);
  tabGroup = viewChild(MatTabGroup);
  sexs: Sex[] = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ];

  ngOnInit() {
    this.personForm = this.createForm();
    this.onEditMode();
    this.loadUsers();
    this.initialSearchCep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const person: Person = this.data?.person;

    return this.fb.group({
      id: [person?.id ?? ''],
      user_id: [person?.user?.id ?? '', [Validators.required, Validators.maxLength(255)]],
      image: [person?.image ?? ''],
      name: [person?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      cpf: [person?.cpf ?? '', [Validators.required, cpfValidator(), Validators.maxLength(14)]],
      birth_date: [person?.birth_date ?? '', [Validators.required]],
      email: [person?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone_one: [person?.phone_one ?? '', [Validators.required, phoneValidator(), Validators.maxLength(15)]],
      phone_two: [person?.phone_two ?? '', [phoneValidator(), Validators.maxLength(15)]],
      sex: [person?.sex ?? '', [Validators.required, Validators.maxLength(1)]],
      cep: [person?.cep ?? '', [Validators.required, Validators.maxLength(9)]],
      street: [person?.street ?? '', [Validators.required, Validators.maxLength(160)]],
      number: [person?.number ?? '', [Validators.required, Validators.maxLength(10)]],
      complement: [person?.complement ?? '', [Validators.maxLength(100)]],
      district: [person?.district ?? '', [Validators.required, Validators.maxLength(100)]],
      city: [person?.city ?? '', [Validators.required, Validators.maxLength(140)]],
      state: [person?.state ?? '', [Validators.required, Validators.maxLength(2)]],
      country: [person?.country ?? '', [Validators.required, Validators.maxLength(50)]],
    });
  }

  private onEditMode() {
    if (this.data?.person?.id) {
      this.isEditMode.set(true);

      if (this.data?.person?.user) {
        this.searchUserControl.setValue(this.data.person.user.name);
        this.personForm.get('user_id')?.setValue(this.data.person.user.id);
      }

      const birthDate = this.data.person.birth_date ? new Date(this.data.person.birth_date) : null;

      const sexValue = this.formatsPipe.SexTransform(this.data.person.sex, 'toModel');

      this.personForm.patchValue({
        birth_date: birthDate,
        sex: sexValue,
      });
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.personForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  clearDate() {
    this.personForm.get('birth_date')?.setValue(null);
  }

  openCalendar(): void {
    if (this.picker()) {
      this.picker()?.open();
    }
  }

  showAllUsers() {
    this.filterUsers = this.searchUserControl.valueChanges.pipe(
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
  }

  private loadUsers() {
    this.loadingService.show();
    this.usersService.getUsers().subscribe({
      next: (data) => (this.user = data),
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  private _filterUsers(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.user.filter((user) => user.name.toLowerCase().includes(filterValue));
  }

  onUserSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value;
    this.searchUserControl.setValue(user.name);
    this.personForm.get('user_id')?.setValue(user.id);
  }

  initialSearchCep() {
    let previousCepValue = this.personForm.get('cep')?.value;
    const cep = this.personForm.get('cep');

    cep?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((cep: string) => {
        if (cep.length === 8 && cep !== previousCepValue) {
          this.searchCep(cep);
        }
        previousCepValue = cep;
      });
  }

  searchCep(cep: string): void {
    if (this.personForm.get('cep')?.value?.length === '') {
      this.loadingService.hide();
      return;
    }

    this.loadingService.show();
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

  handleNext() {
    const identificationFields = ['user_id', 'name', 'cpf', 'birth_date', 'email', 'phone_one', 'phone_two', 'sex'];

    for (const field of identificationFields) {
      const control = this.personForm.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();

      if (control?.invalid) {
        this.toastService.openError('Preencha os campos obrigatórios.');
        return;
      }
    }

    const isIdentificationValid = identificationFields.every((field) => this.personForm.get(field)?.valid);

    if (isIdentificationValid) {
      const tabGroup = this.tabGroup();
      if (tabGroup) {
        tabGroup.selectedIndex = 1;
      }
    }
  }

  handleBack() {
    const tabGroup = this.tabGroup();
    if (tabGroup) {
      tabGroup.selectedIndex = 0;
    }
  }

  handleCancel() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      this.toastService.openError('Preencha todos os campos obrigatórios.');
      return;
    }

    const person = this.personForm.value;

    if (!person) {
      return;
    }

    const personDataSanitized = {
      ...this.sanitizeService.sanitizeInput(person),
      sex: this.personForm.get('sex')?.value,
    };

    if (this.isEditMode()) {
      this.handleUpdate(personDataSanitized.id, personDataSanitized);
    } else {
      this.handleCreate(personDataSanitized);
    }
  }

  handleCreate(data: Person) {
    this.personService.createPerson(data).subscribe({
      next: () => this.notificationService.onSuccess(MESSAGES.CREATE_SUCCESS, this.dialogRef, this.personForm.value),
      error: (error) => this.notificationService.onError(error.error.message ?? MESSAGES.CREATE_ERROR),
      complete: () => this.dialogRef.close(true),
    });
  }

  handleUpdate(personId: string, data: Person) {
    this.personService.updatePerson(personId, data).subscribe({
      next: () => this.notificationService.onSuccess(MESSAGES.UPDATE_SUCCESS, this.dialogRef, this.personForm.value),
      error: (error) => this.notificationService.onError(error.error.message ?? MESSAGES.UPDATE_ERROR),
      complete: () => this.dialogRef.close(true),
    });
  }
}
