import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnComponent } from '@app/components/column/column.component';
import { FormatsPipe } from '@app/components/crud/pipes/formats.pipe';
import { TabDirective } from '@app/components/tabs/tab.directive';
import { TabsComponent } from '@app/components/tabs/tabs.component';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Church } from '@app/model/Church';
import { FinancialCategories } from '@app/model/FinancialCategories';
import {
  CustomerSupplier,
  EntryExit,
  FinancialTransations,
  Payment,
} from '@app/model/FinancialTransations';
import { Members } from '@app/model/Members';
import { Suppliers } from '@app/model/Suppliers';
import { ChurchesService } from '@app/pages/private/administrative/churches/churches.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { MembersService } from '../../../../../members/members.service';
import { FinancialCategoriesService } from '../../../financial-categories/financial-categories.service';
import { SuppliersService } from '../../../suppliers/suppliers.service';

@Component({
  selector: 'app-financial-transactions-form',
  templateUrl: './financial-transactions-form.component.html',
  styleUrl: './financial-transactions-form.component.scss',
  imports: [
    ColumnComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxMaskDirective,
    MatDatepicker,
    MatIconModule,
    MatDatepickerModule,
    MatTabsModule,
    MatTooltipModule,
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
export class FinancialTransactionsFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private membersService = inject(MembersService);
  private suppliersService = inject(SuppliersService);
  private financialCategoriesService = inject(FinancialCategoriesService);
  private churchesService = inject(ChurchesService);
  private toast = inject(ToastService);
  private formatsPipe = inject(FormatsPipe);
  private readonly validationService = inject(ValidationService);
  private readonly dialogRef = inject(MatDialogRef<FinancialTransactionsFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA) as {
    financialTransactions?: FinancialTransations;
    submitSubject?: Subject<void>;
  };

  financialTransactionsForm!: FormGroup;
  isEditMode = signal(false);
  photoPreview: string | ArrayBuffer | null = null;
  readonly minDate = new Date(1900, 0, 1);

  @ViewChild('payment_date') payment_date!: MatDatepicker<Date>;

  private destroy$ = new Subject<void>();

  entryExit = EntryExit;
  customerSupplier = CustomerSupplier;
  payment = Payment;

  entryExitOptions = [
    { label: 'Entrada', value: this.entryExit.ENTRADA },
    { label: 'Saída', value: this.entryExit.SAIDA },
  ];

  customerSupplierOptions = [
    { label: 'Membro', value: this.customerSupplier.MEMBRO },
    { label: 'Fornecedor', value: this.customerSupplier.FORNECEDOR },
    { label: 'Pessoa', value: this.customerSupplier.PESSOA },
  ];

  paymentOptions = [
    { label: 'Dinheiro', value: this.payment.DINHEIRO },
    { label: 'Cartão de Crédito', value: this.payment.CREDITO },
    { label: 'Boleto', value: this.payment.BOLETO },
    { label: 'PIX', value: this.payment.PIX },
    { label: 'Débito', value: this.payment.DEBITO },
    { label: 'Cheque', value: this.payment.CHEQUE },
  ];

  members: Members[] = [];
  suppliers: Suppliers[] = [];
  categories: FinancialCategories[] = [];
  churches: Church[] = [];
  searchControlChurch = new FormControl<string | Church>('');
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();

  ngOnInit() {
    this.financialTransactionsForm = this.createForm();
    this.checkEditMode();
    this.loadInitialData();
    this.setupCalculationLogic();
    this.setupConditionalValidation();
    this.loadData();

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
    const pat: FinancialTransations = this.data?.financialTransactions as FinancialTransations;
    const selectedChurchId = localStorage.getItem('selectedChurch');

    const pDate = this.formatsPipe.parseDateLocal(pat?.payment_date);

    return this.fb.group({
      id: [pat?.id ?? ''],
      church_id: [
        { value: selectedChurchId ?? pat?.church_id ?? '', disabled: true },
        [Validators.required],
      ],
      entry_exit: [pat?.entry_exit ?? '', [Validators.required]],
      customer_supplier: [pat?.customer_supplier ?? '', [Validators.required]],
      member_id: [pat?.member_id ?? (pat as any)?.member?.id ?? ''],
      supplier_id: [pat?.supplier_id ?? (pat as any)?.supplier?.id ?? ''],
      person_name: [pat?.person_name ?? '', [Validators.maxLength(100)]],
      description: [pat?.description ?? '', [Validators.maxLength(255)]],
      cat_financial_id: [pat?.cat_financial_id ?? pat?.category?.id ?? '', [Validators.required]],
      payment: [pat?.payment ?? '', [Validators.required]],
      amount: [pat?.amount ?? 0, [Validators.required]],
      discount: [pat?.discount ?? 0],
      amount_discount: [{ value: pat?.amount_discount ?? 0, disabled: true }],
      payment_date: [pDate, [Validators.required]],
      receipt: [null],
    });
  }

  private setupCalculationLogic() {
    const amountChanges = this.financialTransactionsForm.get('amount')?.valueChanges;
    const discountChanges = this.financialTransactionsForm.get('discount')?.valueChanges;

    if (amountChanges && discountChanges) {
      amountChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.calculateTotal());
      discountChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.calculateTotal());
    }
  }

  private calculateTotal() {
    const amount = Number(this.financialTransactionsForm.get('amount')?.value || 0);
    const discount = Number(this.financialTransactionsForm.get('discount')?.value || 0);
    const total = amount - discount;
    this.financialTransactionsForm
      .get('amount_discount')
      ?.setValue(total > 0 ? total : 0, { emitEvent: false });
  }

  private setupConditionalValidation() {
    this.financialTransactionsForm
      .get('customer_supplier')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: CustomerSupplier) => {
        const memberId = this.financialTransactionsForm.get('member_id');
        const supplierId = this.financialTransactionsForm.get('supplier_id');
        const personName = this.financialTransactionsForm.get('person_name');

        memberId?.clearValidators();
        supplierId?.clearValidators();
        personName?.clearValidators();

        if (value === CustomerSupplier.MEMBRO) {
          memberId?.setValidators([Validators.required]);
        } else if (value === CustomerSupplier.FORNECEDOR) {
          supplierId?.setValidators([Validators.required]);
        } else if (value === CustomerSupplier.PESSOA) {
          personName?.setValidators([Validators.required]);
        }

        memberId?.updateValueAndValidity();
        supplierId?.updateValueAndValidity();
        personName?.updateValueAndValidity();
      });
  }

  private loadInitialData() {
    forkJoin({
      churches: this.churchesService.getChurches(),
      members: this.membersService.findAll(),
      suppliers: this.suppliersService.findAllSuppliers(),
      categories: this.financialCategoriesService.getAllFinancialCategories(),
    }).subscribe({
      next: ({
        churches,
        members,
        suppliers,
        categories,
      }: {
        churches: Church[];
        members: Members[];
        suppliers: Suppliers[];
        categories: FinancialCategories[];
      }) => {
        this.churches = churches;
        this.members = members;
        this.suppliers = suppliers;
        this.categories = categories;

        this.setupAutocomplete();

        const selectedChurchId = localStorage.getItem('selectedChurch');

        if (this.isEditMode() && this.data.financialTransactions) {
          const trans = this.data.financialTransactions;
          const church = this.churches.find(
            (c) => c.id === (trans.church_id || (trans as any).church?.id),
          );
          if (church) this.searchControlChurch.setValue(church);
          this.searchControlChurch.disable();
          this.calculateTotal();
        } else if (selectedChurchId) {
          const church = this.churches.find((c) => c.id === selectedChurchId);
          if (church) {
            this.searchControlChurch.setValue(church);
            this.searchControlChurch.disable();
            this.financialTransactionsForm.get('church_id')?.setValue(church.id);
          }
        }
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
    });
  }

  private setupAutocomplete() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : (value?.name ?? '');
        return name ? this.filterChurch(name) : this.churches.slice();
      }),
    );
  }

  private filterChurch(name: string): Church[] {
    return this.churches.filter((church) => church.name.toLowerCase().includes(name.toLowerCase()));
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const church = event.option.value as Church;
    this.financialTransactionsForm.get('church_id')?.setValue(church.id);
  }

  displayChurch(church: Church): string {
    return church && church.name ? church.name : '';
  }

  showAll() {
    this.searchControlChurch.setValue(this.searchControlChurch.value);
  }

  private checkEditMode(): void {
    if (this.data?.financialTransactions?.id) {
      this.isEditMode.set(true);
      this.disableFieldsForEditMode();

      if (
        this.data.financialTransactions.receipt &&
        typeof this.data.financialTransactions.receipt === 'string'
      ) {
        this.photoPreview = this.data.financialTransactions.receipt;
      }
    }
  }

  private disableFieldsForEditMode(): void {
    const fieldsToDisable = [
      'entry_exit',
      'customer_supplier',
      'member_id',
      'supplier_id',
      'cat_financial_id',
      'payment',
      'amount',
      'payment_date',
    ];

    fieldsToDisable.forEach((field) => {
      this.financialTransactionsForm.get(field)?.disable();
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toast.openError('Selecione apenas imagens.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = reader.result);
    reader.readAsDataURL(file);

    this.financialTransactionsForm.patchValue({ receipt: file });
    this.financialTransactionsForm.get('receipt')?.markAsTouched();
  }

  removePhoto() {
    this.photoPreview = null;
    this.financialTransactionsForm.patchValue({ receipt: null });
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.financialTransactionsForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  private loadData(): void {
    if (this.isEditMode()) {
      const { receipt, payment_date, ...dataToPatch } = this.data.financialTransactions!;

      const pDate = this.formatsPipe.parseDateLocal(
        payment_date as string | Date | null | undefined,
      );

      this.financialTransactionsForm.patchValue({
        ...dataToPatch,
        payment_date: pDate,
      });
      this.financialTransactionsForm.get('customer_supplier')?.updateValueAndValidity();
    }
  }

  handleSubmit() {
    this.financialTransactionsForm.markAllAsTouched();

    if (this.financialTransactionsForm.invalid) {
      this.toast.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
      return;
    }

    const data = this.financialTransactionsForm.getRawValue();
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'payment_date' && data[key] instanceof Date) {
          formData.append(key, data[key].toISOString().split('T')[0]);
        } else if (key === 'receipt' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    if (this.isEditMode()) {
      formData.append('_method', 'PUT');
    }

    this.dialogRef.close(formData);
  }

  clearDate(fieldName: string) {
    this.financialTransactionsForm.get(fieldName)?.reset();
  }
}
