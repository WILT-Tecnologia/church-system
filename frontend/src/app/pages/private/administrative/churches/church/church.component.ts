import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
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
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Address } from '@app/model/Address';
import { Church } from '@app/model/Church';
import { Person } from '@app/model/Person';
import { PersonsService } from '@app/pages/private/administrative/persons/persons.service';
import { CepService } from '@app/services/search-cep/search-cep.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { cnpjValidator } from '@app/services/validators/cnpj-validator';
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

@Component({
  selector: 'app-church',
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatIconModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
  ],
  providers: [provideNgxMask()],
})
export class ChurchComponent implements OnInit, OnDestroy {
  constructor() {}

  private personService = inject(PersonsService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private cepService = inject(CepService);
  private loading = inject(LoadingService);
  private validationService = inject(ValidationService);
  private dialogRef = inject(MatDialogRef<ChurchComponent>);
  private data: { church: Church; submitSubject?: Subject<void> } = inject(MAT_DIALOG_DATA);
  private destroy$ = new Subject<void>();

  churchForm: FormGroup = this.createForm();
  church = signal<Church[]>([]);
  responsible = signal<Person[]>([]);
  isEditMode = signal(false);
  searchResponsibleControl = new FormControl<string>('', [Validators.required]);
  filterResponsable = signal<Observable<Person[]>>(new Observable<Person[]>());
  picker = viewChild(MatDatepicker);
  tabGroup = viewChild(MatTabGroup);

  ngOnInit() {
    this.checkEditMode();
    this.loadResponsibles();
    this.initialSearchCep();
    this.initialFilterResponsibles();

    this.searchResponsibleControl.valueChanges.subscribe((value) => {
      if (!value) {
        this.churchForm.get('responsible_id')?.setValue(null);
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

  private createForm() {
    return this.fb.group({
      id: [this.data?.church?.id ?? ''],
      responsible_id: [this.data?.church?.responsible?.id ?? '', [Validators.required]],
      name: [this.data?.church?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      email: [this.data?.church?.email ?? '', [Validators.required, Validators.email]],
      cnpj: [this.data?.church?.cnpj ?? '', [Validators.required, cnpjValidator]],
      cep: [this.data?.church?.cep ?? '', [Validators.required]],
      street: [this.data?.church?.street ?? '', [Validators.required, Validators.maxLength(255)]],
      number: [this.data?.church?.number ?? '', [Validators.required, Validators.maxLength(10)]],
      complement: [this.data?.church?.complement ?? '', [Validators.maxLength(255)]],
      district: [
        this.data?.church?.district ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [this.data?.church?.city ?? '', [Validators.required, Validators.maxLength(255)]],
      state: [this.data?.church?.state ?? '', [Validators.required, Validators.maxLength(255)]],
      country: [this.data?.church?.country ?? '', [Validators.required, Validators.maxLength(255)]],
    });
  }

  private loadResponsibles() {
    this.personService.getPersons().subscribe({
      next: (res) => {
        this.responsible.set(res);
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private checkEditMode() {
    if (this.data?.church) {
      this.isEditMode.set(true);

      if (this.data?.church?.responsible) {
        this.searchResponsibleControl.setValue(this.data.church.responsible.name);
        this.churchForm.get('responsible_id')?.setValue(this.data.church.responsible.id);
      }

      this.churchForm.patchValue({
        ...this.data.church,
        responsible_id: this.data.church.responsible?.id,
      });
    }
  }

  showAllResponsibles() {
    this.filterResponsable.set(
      this.searchResponsibleControl.valueChanges.pipe(
        startWith(''),
        map((value: any) => {
          if (typeof value === 'string') {
            return value;
          } else {
            return value ? value.name : '';
          }
        }),
        map((name) => (name.length >= 1 ? this._filterResponsables(name) : this.responsible())),
      ),
    );
  }

  private initialFilterResponsibles() {
    this.filterResponsable.set(
      this.searchResponsibleControl.valueChanges.pipe(
        startWith(''),
        map((value: any) => {
          if (typeof value === 'string') {
            return value;
          } else {
            return value ? value.name : '';
          }
        }),
        map((name) => (name.length >= 1 ? this._filterResponsables(name) : this.responsible())),
      ),
    );
  }

  private _filterResponsables(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.responsible().filter((responsible) =>
      responsible.name.toLowerCase().includes(filterValue),
    );
  }

  onResponsibleSelected(event: MatAutocompleteSelectedEvent) {
    const responsible = event.option.value;
    this.searchResponsibleControl.setValue(responsible.name);
    this.churchForm.get('responsible_id')?.setValue(responsible.id);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.churchForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit() {
    this.churchForm.markAllAsTouched();
    this.searchResponsibleControl.markAsTouched();

    if (this.churchForm.valid) {
      this.dialogRef?.close(this.churchForm.value);
    } else {
      this.toast.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
      this.scrollToFirstInvalidControl();
    }
  }

  private scrollToFirstInvalidControl() {
    const controls = this.churchForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        const addressFields = [
          'cep',
          'street',
          'number',
          'complement',
          'district',
          'city',
          'state',
          'country',
        ];
        const targetTabIndex = addressFields.includes(name) ? 1 : 0;

        const tabGroup = this.tabGroup();
        if (tabGroup && tabGroup.selectedIndex !== targetTabIndex) {
          tabGroup.selectedIndex = targetTabIndex;
        }
        break;
      }
    }
  }

  private initialSearchCep() {
    let previousCepValue = this.churchForm.get('cep')?.value;

    this.churchForm
      .get('cep')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((cep: string) => {
        if (cep.length === 8 && cep !== previousCepValue) {
          this.searchCep(cep);
        }
        previousCepValue = cep;
      });
  }

  private searchCep(cep: string): void {
    if (this.churchForm.get('cep')?.value?.length === '') {
      return;
    }

    this.cepService.searchCep(cep).subscribe({
      next: (data: Address) => {
        if (data) {
          this.churchForm.patchValue({
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
}
