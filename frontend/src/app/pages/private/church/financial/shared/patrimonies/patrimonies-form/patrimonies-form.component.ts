import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, map, Observable, startWith, Subject } from 'rxjs';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { Church } from 'app/model/Church';
import { Members } from 'app/model/Members';
import { Patrimonies } from 'app/model/Patrimonies';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { MembersService } from 'app/pages/private/church/members/members.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { PatrimoniesService } from '../patrimonies.service';

@Component({
  selector: 'app-patrimonies-form',
  templateUrl: './patrimonies-form.component.html',
  styleUrl: './patrimonies-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    ColumnComponent,
    ActionsComponent,
    NgxMaskDirective,
  ],
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    FormatsPipe,
  ],
})
export class PatrimoniesFormComponent implements OnInit, OnDestroy {
  constructor() {}

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly loading = inject(LoadingService);
  private readonly validationService = inject(ValidationService);
  private readonly notification = inject(NotificationService);
  private readonly churchsService = inject(ChurchsService);
  private readonly patrimoniesService = inject(PatrimoniesService);
  private readonly membersService = inject(MembersService);
  private readonly dialogRef = inject(MatDialogRef<PatrimoniesFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  patrimoniesForm!: FormGroup;

  searchControlChurch = new FormControl<string | Church>('');
  searchControlMember = new FormControl<string | Members>('');

  churchs: Church[] = [];
  members: Members[] = [];
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();
  filteredMember: Observable<Members[]> = new Observable<Members[]>();
  isEditMode: boolean = false;
  photoPreview: string | ArrayBuffer | null = null;
  readonly minDate = new Date(1900, 0, 1);

  @ViewChild('registration_date') registration_date!: MatDatepicker<Date>;

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.patrimoniesForm = this.createForm();
    this.checkEditMode();
    this.loadData();
    this.setupConditionalValidations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const patrimonies: Patrimonies = this.data?.patrimonies || this.data;

    let regDate = new Date();
    if (patrimonies?.registration_date) {
      const dateString = patrimonies.registration_date.endsWith('Z')
        ? patrimonies.registration_date.slice(0, -1)
        : patrimonies.registration_date;

      regDate = new Date(dateString);
    }

    return this.fb.group({
      id: [patrimonies?.id ?? ''],
      church_id: [patrimonies?.church?.id ?? '', [Validators.required]],
      number: [patrimonies?.number ?? null, [Validators.required, Validators.minLength(0), Validators.maxLength(50)]],
      name: [patrimonies?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      registration_date: [regDate, Validators.required],
      description: [patrimonies?.description ?? '', [Validators.maxLength(255)]],
      type_entry: [patrimonies?.type_entry ?? '', Validators.required],
      price: [patrimonies?.price ?? 0],
      is_member: [patrimonies?.is_member ?? false],
      member_id: [patrimonies?.member?.id ?? ''],
      donor: [patrimonies?.donor ?? null],
      photo: [null],
    });
  }

  private setupConditionalValidations() {
    this.patrimoniesForm
      .get('type_entry')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateConditionalFields());

    this.patrimoniesForm
      .get('is_member')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateConditionalFields());

    this.updateConditionalFields();
  }

  private updateConditionalFields() {
    const typeEntry = this.patrimoniesForm.get('type_entry')?.value;
    const isMember = this.patrimoniesForm.get('is_member')?.value;

    const priceCtrl = this.patrimoniesForm.get('price');
    const donorCtrl = this.patrimoniesForm.get('donor');
    const memberCtrl = this.patrimoniesForm.get('member_id');

    /* =======================
     * COMPRA (C)
     * ======================= */
    if (typeEntry === 'C') {
      priceCtrl?.enable();
      priceCtrl?.setValidators([Validators.required, Validators.min(0)]);

      donorCtrl?.clearValidators();
      donorCtrl?.setValue(null);
      donorCtrl?.disable();
      memberCtrl?.clearValidators();
      memberCtrl?.setValue(null);
      memberCtrl?.disable();
    } else if (typeEntry === 'D') {
      /* =======================
       * DOAÇÃO (D)
       * ======================= */

      priceCtrl?.clearValidators();
      priceCtrl?.setValue(null);
      priceCtrl?.disable();

      if (isMember) {
        memberCtrl?.enable();
        memberCtrl?.setValidators([Validators.required]);

        donorCtrl?.clearValidators();
        donorCtrl?.setValue(null);
        donorCtrl?.disable();
      } else {
        donorCtrl?.enable();
        donorCtrl?.setValidators([Validators.required, Validators.maxLength(255)]);

        memberCtrl?.clearValidators();
        memberCtrl?.setValue(null);
        memberCtrl?.disable();
      }
    } else {
      /* =======================
       * TRANSFERÊNCIA (T)
       * ======================= */
      priceCtrl?.clearValidators();
      priceCtrl?.setValue(null);
      priceCtrl?.disable();

      donorCtrl?.clearValidators();
      donorCtrl?.setValue(null);
      donorCtrl?.disable();

      memberCtrl?.clearValidators();
      memberCtrl?.setValue(null);
      memberCtrl?.disable();
    }

    priceCtrl?.updateValueAndValidity({ emitEvent: false });
    donorCtrl?.updateValueAndValidity({ emitEvent: false });
    memberCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  displayChurch(church: Church): string {
    return church && church.name ? church.name : '';
  }

  displayMember(member: Members): string {
    return member && member.person && member.person.name ? member.person.name : '';
  }

  private loadData() {
    forkJoin({
      churchs: this.churchsService.getChurch(),
      members: this.membersService.findAll(),
    }).subscribe({
      next: ({ churchs, members }) => {
        this.churchs = churchs;
        this.members = members;
        this.setupAutocomplete();

        if (this.isEditMode && this.data.patrimonies) {
          const pat = this.data.patrimonies as Patrimonies;
          const church = this.churchs.find((c) => c.id === pat.church?.id);
          const member = this.members.find((m) => m.id === pat.member?.id);

          if (church) this.searchControlChurch.setValue(church);
          if (member) this.searchControlMember.setValue(member);
        }
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
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

    this.filteredMember = this.searchControlMember.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : (value?.person?.name ?? '');
        return name ? this.filterMember(name) : this.members.slice();
      }),
    );
  }

  private filterChurch(name: string): Church[] {
    return this.churchs.filter((church) => church.name.toLowerCase().includes(name.toLowerCase()));
  }

  private filterMember(name: string): Members[] {
    return this.members.filter((church) => church?.person?.name.toLowerCase().includes(name.toLowerCase()));
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const church = event.option.value as Church;
    this.patrimoniesForm.get('church_id')?.setValue(church.id);
  }

  onMemberSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMember = event.option.value as Members;
    this.patrimoniesForm.get('member_id')?.setValue(selectedMember.id);
  }

  showAll() {
    this.searchControlChurch.setValue(this.searchControlChurch.value);
    this.searchControlMember.setValue(this.searchControlMember.value);
  }

  private checkEditMode() {
    if (this.data?.patrimonies?.id) {
      this.isEditMode = true;

      if (this.data.patrimonies.photo) {
        this.photoPreview = this.data.patrimonies.photo;
        this.patrimoniesForm.patchValue({ photo: this.data.patrimonies.photo });
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notification.onError('Selecione apenas imagens.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = reader.result);
    reader.readAsDataURL(file);

    this.patrimoniesForm.patchValue({ photo: file });
    this.patrimoniesForm.get('photo')?.markAsTouched();
  }

  removePhoto() {
    this.photoPreview = null;
    this.patrimoniesForm.patchValue({ photo: null });
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.patrimoniesForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  handleCancel() {
    this.dialogRef?.close(false);
  }

  handleSubmit() {
    if (this.patrimoniesForm.invalid) {
      this.patrimoniesForm.markAllAsTouched();
      this.notification.onError('Verifique os campos obrigatórios.');
      return;
    }

    const formValue = this.patrimoniesForm;

    if (formValue.value.type_entry === 'C' && formValue.value.price != null) {
      formValue.value.price = parseFloat(formValue.value.price).toFixed(2);
    }

    if (this.isEditMode && formValue.valid) {
      this.handleUpdate(this.data?.patrimonies?.id, formValue.value);
    } else {
      this.handleCreate(formValue.value);
    }
  }

  private handleCreate(data: Patrimonies) {
    this.loading.show();
    this.patrimoniesService.create(data).subscribe({
      next: (patrimonies) => {
        this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef?.close(patrimonies);
      },
      error: (err) => this.notification.onError(err.error?.message || 'Erro ao salvar patrimônio.'),
      complete: () => this.loading.hide(),
    });
  }

  private handleUpdate(id: string, data: Patrimonies) {
    this.loading.show();
    this.patrimoniesService.update(id, data).subscribe({
      next: (patrimonies) => {
        this.loading.hide();
        this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef?.close(patrimonies);
      },
      error: (err) => this.notification.onError(err.error?.message || 'Erro ao atualizar patrimônio.'),
      complete: () => this.loading.hide(),
    });
  }

  clearDate(fieldName: string) {
    this.patrimoniesForm.get(fieldName)?.reset();
  }

  private openCalendarDate(): void {
    if (this.registration_date) {
      this.registration_date.open();
    }
  }
}
