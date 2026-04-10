import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabGroup } from '@angular/material/tabs';
import { ColumnComponent } from '@app/components/column/column.component';
import { FormatsPipe } from '@app/components/crud/pipes/formats.pipe';
import { LoadingService } from '@app/components/loading/loading.service';
import { TabDirective } from '@app/components/tabs/tab.directive';
import { TabsComponent } from '@app/components/tabs/tabs.component';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Address } from '@app/model/Address';
import { Guest } from '@app/model/Guest';
import { CepService } from '@app/services/search-cep/search-cep.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { phoneValidator } from '@app/services/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-guests-form',
  templateUrl: './guests-form.component.html',
  styleUrl: './guests-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatDividerModule,
    MatIconModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    TabsComponent,
    TabDirective,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
    FormatsPipe,
  ],
})
export class GuestsFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly cepService = inject(CepService);
  private readonly loading = inject(LoadingService);
  private readonly validationService = inject(ValidationService);
  private readonly dialogRef = inject(MatDialogRef<GuestsFormComponent>);
  private readonly toastService = inject(ToastService);
  private readonly data: { guest: Guest; submitSubject: Subject<void> } = inject(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  guestForm: FormGroup = this.createForm();
  isEditMode = signal(false);
  picker = viewChild(MatDatepicker);
  tabGroup = viewChild(MatTabGroup);

  ngOnInit() {
    this.checkEditMode();
    this.initialSearchCep();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    const guest: Guest = this.data?.guest;

    return this.fb.group({
      id: [guest?.id ?? ''],
      name: [guest?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      phone_one: [guest?.phone_one ?? '', [Validators.required, phoneValidator()]],
      phone_two: [guest?.phone_two ?? '', [phoneValidator()]],
      cep: [guest?.cep ?? '', [Validators.required]],
      street: [guest?.street ?? '', [Validators.required, Validators.maxLength(255)]],
      number: [guest?.number ?? '', [Validators.required, Validators.maxLength(10)]],
      complement: [guest?.complement ?? '', [Validators.maxLength(255)]],
      district: [guest?.district ?? '', [Validators.required, Validators.maxLength(255)]],
      city: [guest?.city ?? '', [Validators.required, Validators.maxLength(255)]],
      state: [guest?.state ?? '', [Validators.required, Validators.maxLength(255)]],
      country: [guest?.country ?? '', [Validators.required, Validators.maxLength(255)]],
    });
  }

  private checkEditMode() {
    if (this.data && this.data?.guest) {
      this.isEditMode.set(true);
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.guestForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  private initialSearchCep() {
    let previousCepValue = this.guestForm.get('cep')?.value;
    const cep = this.guestForm.get('cep');

    cep?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((cep: string) => {
        if (cep.length === 8 && cep !== previousCepValue) {
          this.searchCep(cep);
        }
        previousCepValue = cep;
      });
  }

  private searchCep(cep: string): void {
    if (this.guestForm.get('cep')?.value?.length === '') {
      return;
    }

    this.cepService.searchCep(cep).subscribe({
      next: (data: Address) => {
        if (data) {
          this.guestForm.patchValue({
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
    this.guestForm.markAllAsTouched();

    if (this.guestForm.valid) {
      const guest: Guest = this.guestForm.value;
      guest.phone_one = guest.phone_one.replace(/\D/g, '');
      guest.phone_two = guest.phone_two.replace(/\D/g, '');

      this.dialogRef?.close(guest);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }
}
