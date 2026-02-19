import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { Suppliers, TypeService, TypeSupplier } from 'app/model/Suppliers';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { AuthService } from 'app/services/auth/auth.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith } from 'rxjs';
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
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private suppliersService = inject(SuppliersService);
  private readonly validationService = inject(ValidationService);
  private authService = inject(AuthService);
  private churchsService = inject(ChurchsService);
  private toast = inject(ToastService);
  private dialog = inject(ModalService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private readonly dialogRef = inject(MatDialogRef<SupplierFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  supplierForm!: FormGroup;
  isEditMode = signal(false);

  searchControlChurch = new FormControl<string | Church>('');
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();

  type_suppliers: TypeSupplier[] = [TypeSupplier.PF, TypeSupplier.PJ];
  type_services: TypeService[] = [TypeService.PRODUTO, TypeService.SERVICO, TypeService.AMBOS];

  churchs: Church[] = [];

  constructor() {
    effect(() => {
      this.isEditMode.set(this.route.snapshot.data['isEditMode']);
    });
  }

  ngOnInit() {
    this.supplierForm = this.createForm();
    this.checkEditMode();
    this.loadData();
  }

  private createForm(): FormGroup {
    const pat = this.data.suppliers as Suppliers;

    return this.fb.group({
      id: [pat?.id ?? ''],
      church_id: [pat?.church?.id ?? '', [Validators.required]],
      name: [pat?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      type_supplier: [pat?.type_supplier ?? '', [Validators.required]],
      cpf_cnpj: [pat?.cpf_cnpj ?? '', [Validators.required, Validators.maxLength(18)]],
      type_service: [pat?.type_service ?? '', [Validators.required]],
      status: [pat?.status ?? true, [Validators.required]],
      pix_key: [pat?.pix_key ?? '', [Validators.maxLength(100)]],
      cep: [pat?.cep ?? '', [Validators.maxLength(8)]],
      street: [pat?.street ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      number: [pat?.number ?? '', [Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      district: [pat?.district ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      city: [pat?.city ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      uf: [pat?.uf ?? '', [Validators.maxLength(2), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      country: [pat?.country ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      phone_one: [pat?.phone_one ?? '', [Validators.maxLength(11), Validators.pattern('^[0-9]*$')]],
      phone_two: [pat?.phone_two ?? '', [Validators.maxLength(11), Validators.pattern('^[0-9]*$')]],
      phone_three: [pat?.phone_three ?? '', [Validators.maxLength(11), Validators.pattern('^[0-9]*$')]],
      email: [pat?.email ?? '', [Validators.email, Validators.maxLength(100)]],
      contact_name: [pat?.contact_name ?? '', [Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
      obs: [pat?.obs ?? '', [Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9 ]*$')]],
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

        if (this.isEditMode() && this.data.suppliers) {
          const pat = this.data.suppliers as Suppliers;
          const church = this.churchs.find((c) => c.id === pat.church?.id);

          if (church) this.searchControlChurch.setValue(church);
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
      this.toast.openError('Verifique os campos obrigatórios.');
      return;
    }

    const formValue = this.supplierForm;

    if (this.isEditMode() && formValue.valid) {
      this.handleUpdate(this.data?.suppliers?.id, formValue.value);
    } else {
      this.handleCreate(formValue.value);
    }
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
