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
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Address } from 'app/model/Address';
import { Person } from 'app/model/Person';
import { User } from 'app/model/User';
import { CepService } from 'app/services/search-cep/search-cep.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { cpfValidator } from 'app/services/validators/cpf-validator';
import { phoneValidator } from 'app/services/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UsersService } from '../../users/users.service';

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
    NgxMaskDirective,
  ],
})
export class PersonComponent implements OnInit, OnDestroy {
  private user: User[] = [];
  private readonly currentDate = new Date();
  public readonly minDate = new Date(
    this.currentDate.getFullYear() - 100,
    this.currentDate.getMonth(),
    this.currentDate.getDate(),
  );
  public readonly maxDate = this.currentDate;
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private validationService = inject(ValidationService);
  private toastService = inject(ToastService);
  private cepService = inject(CepService);
  private loading = inject(LoadingService);
  private formatsPipe = inject(FormatsPipe);
  private dialogRef = inject(MatDialogRef<PersonComponent>);
  private data: { person: Person; submitSubject: Subject<void> } = inject(MAT_DIALOG_DATA);

  personForm!: FormGroup;
  isEditMode = signal(false);
  searchUserControl = new FormControl<string>('', [Validators.required]);
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

    this.searchUserControl.valueChanges.subscribe((value) => {
      if (!value || typeof value === 'string') {
        this.personForm.get('user_id')?.setValue(null);
        this.personForm.get('user_id')?.markAsTouched();
      }
    });

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
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

  onUserSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as User;
    this.searchUserControl.setValue(user.name, { emitEvent: false });
    this.personForm.get('user_id')?.setValue(user.id);
  }

  private loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => (this.user = data),
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private _filterUsers(name: string): User[] {
    const filterValue = name.toLowerCase();
    return this.user.filter((user) => user.name.toLowerCase().includes(filterValue));
  }

  private initialSearchCep() {
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

  private searchCep(cep: string): void {
    if (this.personForm.get('cep')?.value?.length === '') {
      this.loading.hide();
      return;
    }

    this.loading.show();
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

  handleSubmit() {
    this.personForm.markAllAsTouched();
    this.searchUserControl.markAsTouched();

    if (this.personForm.valid) {
      this.dialogRef?.close(this.personForm.value);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
      this.scrollToFirstInvalidControl();
    }
  }

  private scrollToFirstInvalidControl() {
    const controls = this.personForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        const addressFields = ['cep', 'street', 'number', 'complement', 'district', 'city', 'state', 'country'];
        const targetTabIndex = addressFields.includes(name) ? 1 : 0;

        const tabGroup = this.tabGroup();
        if (tabGroup && tabGroup.selectedIndex !== targetTabIndex) {
          tabGroup.selectedIndex = targetTabIndex;
        }
        break;
      }
    }
  }
}
