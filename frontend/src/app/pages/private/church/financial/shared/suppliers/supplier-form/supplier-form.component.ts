import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Address } from 'app/model/Address';
import { Church } from 'app/model/Church';
import { Suppliers, TypeService, TypeSupplier } from 'app/model/Suppliers';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { CepService } from 'app/services/search-cep/search-cep.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { phoneValidator } from 'app/services/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { SuppliersService } from '../suppliers.service';

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
    ActionsComponent,
    MatButtonModule,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class SupplierFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private suppliersService = inject(SuppliersService);
  private readonly validationService = inject(ValidationService);
  private churchsService = inject(ChurchsService);
  private toast = inject(ToastService);
  private cepService = inject(CepService);
  private readonly dialogRef = inject(MatDialogRef<SupplierFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  supplierForm!: FormGroup;
  isEditMode = signal(false);
  private destroy$ = new Subject<void>();
  searchControlChurch = new FormControl<string | Church>('');
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();

  type_suppliers: {
    value: TypeSupplier;
    label: string;
  }[] = [
    { value: TypeSupplier.PF, label: 'Pessoa Física' },
    { value: TypeSupplier.PJ, label: 'Pessoa Jurídica' },
  ];

  type_services: {
    value: TypeService;
    label: string;
  }[] = [
    { value: TypeService.PRODUTO, label: 'Produto' },
    { value: TypeService.SERVICO, label: 'Serviço' },
    { value: TypeService.AMBOS, label: 'Ambos' },
  ];

  churchs: Church[] = [];

  ngOnInit() {
    this.supplierForm = this.createForm();
    this.checkEditMode();
    this.loadData();
    this.initialSearchCep();
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
      contact_name: [pat?.contact_name ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9]*$')]],
      obs: [pat?.obs ?? '', [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9]*$')]],
    });
  }

  initialSearchCep() {
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

  searchCep(cep: string): void {
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
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.toast.openSuccess(MESSAGES.LOADING_SUCCESS),
    });
  }

  displayChurch(church: Church): string {
    return church && church.name ? church.name : '';
  }

  private loadData() {
    forkJoin({
      churchs: this.churchsService.getChurch(),
    }).subscribe({
      next: ({ churchs }) => {
        this.churchs = churchs;
        this.setupAutocomplete();

        const selectedChurchId = localStorage.getItem('selectedChurch');

        if (this.isEditMode() && this.data.suppliers) {
          const pat = this.data.suppliers as Suppliers;
          const church = this.churchs.find((c) => c.id === pat.church?.id);

          if (church) this.searchControlChurch.setValue(church);
        } else if (selectedChurchId) {
          const church = this.churchs.find((c) => c.id === selectedChurchId);

          if (church) {
            this.searchControlChurch.setValue(church);
            this.searchControlChurch.disable();
            this.supplierForm.get('church_id')?.setValue(church.id);
          }
        }
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.setupAutocomplete(),
    });
  }

  private setupAutocomplete() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : (value?.name ?? '');
        return name ? this.filterChurch(name) : this.churchs.slice();
      }),
    );
  }

  private filterChurch(name: string): Church[] {
    return this.churchs.filter((church) => church.name.toLowerCase().includes(name.toLowerCase()));
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const church = event.option.value as Church;
    this.supplierForm.get('church_id')?.setValue(church.id);
  }

  showAll() {
    this.searchControlChurch.setValue(this.searchControlChurch.value);
  }

  private checkEditMode() {
    if (this.data?.suppliers?.id) {
      this.isEditMode.set(true);
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.supplierForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  handleCancel() {
    this.dialogRef?.close();
  }

  handleSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      this.toast.openError('Verifique os dados informados.');
      return;
    }

    if (this.isEditMode()) {
      this.handleUpdate(this.data?.suppliers?.id, this.supplierForm.getRawValue());
    } else {
      this.checkDuplicateAndCreate(this.supplierForm.getRawValue());
    }
  }

  private checkDuplicateAndCreate(data: Suppliers) {
    this.suppliersService.findAllSuppliers().subscribe({
      next: (suppliers) => {
        const cpfCnpjOnlyNumbers = data.cpf_cnpj.replace(/\D/g, '');
        const duplicate = suppliers.find(
          (s) => s.church_id === data.church_id && s.cpf_cnpj.replace(/\D/g, '') === cpfCnpjOnlyNumbers,
        );

        if (duplicate) {
          const typeLabel = data.type_supplier === TypeSupplier.PF ? 'CPF' : 'CNPJ';
          this.toast.openError(`Já existe um fornecedor cadastrado com o mesmo ${typeLabel}.`);
        } else {
          this.handleCreate(data);
        }
      },
      error: () => {
        this.toast.openError('Erro ao verificar fornecedores existentes.');
      },
    });
  }

  private handleCreate(data: Suppliers) {
    this.suppliersService.createSuppliers(data).subscribe({
      next: (suppliers) => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef?.close(suppliers);
      },
      error: (err) => this.toast.openError(err.error?.message || 'Erro ao salvar o fornecedor.'),
    });
  }

  private handleUpdate(id: string, data: Suppliers) {
    this.suppliersService.updateSuppliers(id, data).subscribe({
      next: (suppliers) => {
        this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef?.close(suppliers);
      },
      error: (err) => this.toast.openError(err.error?.message || 'Erro ao atualizar o fornecedor.'),
    });
  }
}
