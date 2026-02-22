import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { FinancialCategories } from 'app/model/FinancialCategories';
import { CustomerSupplier, EntryExit, FinancialTransations, Payment } from 'app/model/FinancialTransations';
import { Members } from 'app/model/Members';
import { Suppliers } from 'app/model/Suppliers';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { MembersService } from '../../../../../members/members.service';
import { FinancialCategoriesService } from '../../../financial-categories/financial-categories.service';
import { SuppliersService } from '../../../suppliers/suppliers.service';
import { FinancialTransactionsService } from '../../financial-transactions.service';

@Component({
  selector: 'app-financial-transactions-form',
  templateUrl: './financial-transactions-form.component.html',
  styleUrl: './financial-transactions-form.component.scss',
  imports: [
    ColumnComponent,
    ActionsComponent,
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
  private financialTransactionsService = inject(FinancialTransactionsService);
  private membersService = inject(MembersService);
  private suppliersService = inject(SuppliersService);
  private financialCategoriesService = inject(FinancialCategoriesService);
  private churchsService = inject(ChurchsService);
  private readonly validationService = inject(ValidationService);
  private toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<FinancialTransactionsFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA) as { financialTransactions: FinancialTransations };

  financialTransactionsForm!: FormGroup;
  isEditMode = signal(false);
  photoPreview: string | ArrayBuffer | null = null;
  readonly minDate = new Date(1900, 0, 1);

  @ViewChild('payment_date') payment_date!: MatDatepicker<Date>;

  private destroy$ = new Subject<void>();
  private readonly loadingService = inject(LoadingService);

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const pat: FinancialTransations = this.data?.financialTransactions;
    const selectedChurchId = localStorage.getItem('selectedChurch');

    let pDate = new Date();
    if (pat?.payment_date) {
      if (typeof pat.payment_date === 'string') {
        const dateString = pat.payment_date.endsWith('Z') ? pat.payment_date.slice(0, -1) : pat.payment_date;
        pDate = new Date(dateString);
      } else {
        pDate = pat.payment_date;
      }
    }

    return this.fb.group({
      id: [pat?.id ?? ''],
      church_id: [{ value: selectedChurchId ?? pat?.church_id ?? '', disabled: true }, [Validators.required]],
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
    this.financialTransactionsForm.get('amount_discount')?.setValue(total > 0 ? total : 0, { emitEvent: false });
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
      churches: this.churchsService.getChurch(),
      members: this.membersService.findAll(),
      suppliers: this.suppliersService.findAllSuppliers(),
      categories: this.financialCategoriesService.findAllFinancialCategories(),
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
          const church = this.churches.find((c) => c.id === (trans.church_id || (trans as any).church?.id));
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

      if (this.data.financialTransactions.receipt && typeof this.data.financialTransactions.receipt === 'string') {
        this.photoPreview = this.data.financialTransactions.receipt;
      }
    }
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
      this.financialTransactionsForm.patchValue(this.data.financialTransactions);
      this.financialTransactionsForm.get('customer_supplier')?.updateValueAndValidity();
    }
  }

  handleSubmit() {
    if (this.financialTransactionsForm.invalid) {
      this.financialTransactionsForm.markAllAsTouched();
      this.toast.openError(MESSAGES.FORM_INVALID);
      return;
    }

    if (this.isEditMode()) {
      this.updateFinancialTransactions(
        this.data?.financialTransactions?.id,
        this.financialTransactionsForm.getRawValue(),
      );
    } else {
      this.handleCreate(this.financialTransactionsForm.getRawValue());
    }
  }

  private handleCreate(data: any) {
    this.loadingService.show();

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

    this.financialTransactionsService.createWithFormData(formData).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef?.close(true);
      },
      error: (error) => {
        this.toast.openError(error.error.message || 'Erro ao salvar');
      },
      complete: () => this.loadingService.hide(),
    });
  }

  private updateFinancialTransactions(id: string, data: any) {
    this.loadingService.show();

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

    formData.append('_method', 'PUT');

    // Laravel uses POST for updates when sending files via FormData due to PHP limitations with PUT
    this.financialTransactionsService.updateWithFormData(id, formData).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef?.close(true);
      },
      error: (error) => {
        this.toast.openError(error.error.message || 'Erro ao atualizar');
      },
      complete: () => this.loadingService.hide(),
    });
  }

  handleCancel() {
    this.dialogRef.close(false);
  }

  clearDate(fieldName: string) {
    this.financialTransactionsForm.get(fieldName)?.reset();
  }

  private openCalendarDate(): void {
    if (this.payment_date) {
      this.payment_date.open();
    }
  }
}
