import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ColumnComponent } from '@app/components/column/column.component';
import { FormatsPipe } from '@app/components/crud/pipes/formats.pipe';
import { TabDirective } from '@app/components/tabs/tab.directive';
import { TabsComponent } from '@app/components/tabs/tabs.component';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Address } from '@app/model/Address';
import { Church } from '@app/model/Church';
import { Suppliers, TypeService, TypeSupplier } from '@app/model/Suppliers';
import { ChurchesService } from '@app/pages/private/administrative/churches/churches.service';
import { CepService } from '@app/services/search-cep/search-cep.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { phoneValidator } from '@app/services/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { SuppliersService } from '../suppliers.service';

interface TypeSupplierProps {
  value: string;
  label: string;
}

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatSelectModule,
    MatRadioModule,
    MatTabsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ColumnComponent,
    NgxMaskDirective,
    TabsComponent,
    TabDirective,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class SupplierFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly suppliersService = inject(SuppliersService);
  private readonly validationService = inject(ValidationService);
  private readonly churchesService = inject(ChurchesService);
  private readonly toastService = inject(ToastService);
  private readonly cepService = inject(CepService);
  private readonly dialogRef = inject(MatDialogRef<SupplierFormComponent>);
  private readonly data: { suppliers: Suppliers; submitSubject: Subject<void> } =
    inject(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  churchs = signal<Church[]>([]);
  supplierForm!: FormGroup;
  isEditMode = signal(false);
  searchControlChurch = new FormControl<string | Church>('');
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();
  type_suppliers: TypeSupplierProps[] = [
    { value: TypeSupplier.PF, label: 'Pessoa Física' },
    { value: TypeSupplier.PJ, label: 'Pessoa Jurídica' },
  ];
  type_services: TypeSupplierProps[] = [
    { value: TypeService.PRODUTO, label: 'Produto' },
    { value: TypeService.SERVICO, label: 'Serviço' },
    { value: TypeService.AMBOS, label: 'Ambos' },
  ];

  ngOnInit() {
    this.supplierForm = this.createForm();
    this.checkEditMode();
    this.loadData();
    this.initialSearchCep();

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
    const pat = this.data.suppliers as Suppliers;

    return this.fb.group({
      id: [pat?.id ?? ''],
      church_id: [pat?.church?.id ?? '', [Validators.required]],
      name: [pat?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      type_supplier: [pat?.type_supplier ?? '', [Validators.required, Validators.maxLength(50)]],
      cpf_cnpj: [pat?.cpf_cnpj ?? '', [Validators.required, Validators.maxLength(18)]],
      type_service: [pat?.type_service ?? '', [Validators.required, Validators.maxLength(50)]],
      status: [pat?.status ?? true, [Validators.required]],
      pix_key: [pat?.pix_key ?? '', [Validators.maxLength(100)]],
      cep: [pat?.cep ?? '', [Validators.maxLength(8), Validators.pattern('^[0-9]*$')]],
      street: [pat?.street ?? '', [Validators.maxLength(100)]],
      number: [pat?.number ?? '', [Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      district: [pat?.district ?? '', [Validators.maxLength(100)]],
      city: [{ value: pat?.city ?? '', disabled: true }, [Validators.maxLength(100)]],
      uf: [{ value: pat?.uf ?? '', disabled: true }, [Validators.maxLength(2)]],
      country: [pat?.country ?? '', [Validators.maxLength(100)]],
      phone_one: [pat?.phone_one ?? '', [Validators.maxLength(11), phoneValidator()]],
      phone_two: [pat?.phone_two ?? '', [Validators.maxLength(11), phoneValidator()]],
      phone_three: [pat?.phone_three ?? '', [Validators.maxLength(11), phoneValidator()]],
      email: [pat?.email ?? '', [Validators.email, Validators.maxLength(100)]],
      contact_name: [
        pat?.contact_name ?? '',
        [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9]*$')],
      ],
      obs: [pat?.obs ?? '', [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9]*$')]],
    });
  }

  private initialSearchCep() {
    let previousCepValue = this.supplierForm.get('cep')?.value;

    this.supplierForm
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
    if (this.supplierForm.get('cep')?.value?.length === '') {
      return;
    }

    this.cepService.searchCep(cep).subscribe({
      next: (data: Address) => {
        if (data) {
          this.supplierForm.patchValue({
            street: data.street || '',
            district: data.neighborhood || '',
            city: data.city || '',
            uf: data.state || '',
          });
        }
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.toastService.openSuccess(MESSAGES.LOADING_SUCCESS),
    });
  }

  displayChurch(church: Church): string {
    return church && church.name ? church.name : '';
  }

  private loadData() {
    forkJoin({
      churchs: this.churchesService.getChurches(),
    }).subscribe({
      next: ({ churchs }) => {
        this.churchs.set(churchs);
        this.setupAutocomplete();

        const selectedChurchId = localStorage.getItem('selectedChurch');

        if (this.isEditMode() && this.data.suppliers) {
          const pat = this.data.suppliers as Suppliers;
          const church = this.churchs().find((c) => c.id === pat.church?.id);

          if (church) this.searchControlChurch.setValue(church);
        } else if (selectedChurchId) {
          const church = this.churchs().find((c) => c.id === selectedChurchId);

          if (church) {
            this.searchControlChurch.setValue(church);
            this.searchControlChurch.disable();
            this.supplierForm.get('church_id')?.setValue(church.id);
          }
        }
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => {},
    });
  }

  private setupAutocomplete() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : (value?.name ?? '');
        return name ? this.filterChurch(name) : this.churchs().slice();
      }),
    );
  }

  private filterChurch(name: string): Church[] {
    return this.churchs().filter((church) =>
      church.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const church = event.option.value as Church;
    this.supplierForm.get('church_id')?.setValue(church.id);
  }

  showAll() {
    this.searchControlChurch.setValue(this.searchControlChurch.value);
  }

  private checkEditMode() {
    if (this.data?.suppliers && this.data?.suppliers?.id) {
      this.isEditMode.set(true);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.supplierForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit() {
    this.supplierForm.markAllAsTouched();
    this.handleSave();
  }

  private handleSave() {
    if (this.supplierForm.valid) {
      this.checkDuplicateAndSave(this.supplierForm.getRawValue());
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }

  private checkDuplicateAndSave(data: Suppliers) {
    this.suppliersService.findAllSuppliers().subscribe({
      next: (suppliers) => {
        const cpfCnpjOnlyNumbers = data.cpf_cnpj.replace(/\D/g, '');
        const duplicate = suppliers.find(
          (s) =>
            (s.church_id === data.church_id || s.church?.id === data.church_id) &&
            s.cpf_cnpj.replace(/\D/g, '') === cpfCnpjOnlyNumbers &&
            s.id !== data.id,
        );

        if (duplicate) {
          const typeLabel = data.type_supplier === TypeSupplier.PF ? 'CPF' : 'CNPJ';
          this.toastService.openError(
            `Já existe um fornecedor cadastrado com o mesmo ${typeLabel}.`,
          );
        } else {
          this.dialogRef.close(data);
        }
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
    });
  }
}
