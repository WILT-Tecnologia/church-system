import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Address } from 'app/model/Address';
import { Church } from 'app/model/Church';
import { Person as Responsible } from 'app/model/Person';
import { CepService } from 'app/services/search-cep/search-cep.service';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import dayjs from 'dayjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {
  debounceTime,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { ChurchsService } from '../churchs.service';

@Component({
  selector: 'app-church',
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
  ],
  providers: [provideNgxMask()],
})
export class ChurchComponent implements OnInit, OnDestroy {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  churchForm: FormGroup;
  churchId: string | null = null;
  isEditMode: boolean = false;

  searchControl = new FormControl('');
  filteredResponsables$!: Observable<Responsible[]>;

  responsible: Responsible[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private churchsService: ChurchsService,
    private toast: ToastService,
    private cepService: CepService,
    private loading: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<ChurchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { church: Church },
  ) {
    this.churchForm = this.createForm();

    this.filteredResponsables$ = this.setupSearchObservable('responsible');
  }

  ngOnInit() {
    this.fetchResponsables();

    if (this.data && this.data?.church) {
      this.isEditMode = true;
      this.churchId = this.data?.church?.id;
      this.churchForm.patchValue({
        ...this.data.church,
        responsible_id: this.data.church.responsible?.id,
      });
      this.handleEditMode();
    }

    this.churchForm.get('responsible_id')?.valueChanges.subscribe((id) => {
      const responsable = this.responsible.find((resp) => resp.id === id);
      return responsable ? responsable?.name : 'Selecione o responsável';
    });

    this.churchForm
      .get('cep')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((cep: string) => {
        if (cep.length === 8) {
          this.searchCep(cep);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchObservable(target: string): Observable<any[]> {
    return this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => {
        const items = (this as any)[target] || [];
        return items
          .filter((item: any) =>
            item.name.toLowerCase().includes(searchTerm?.toLowerCase()),
          )
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
    );
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.church?.id || ''],
      responsible_id: [
        this.data?.church?.responsible?.id || '',
        [Validators.required],
      ],
      name: [
        this.data?.church?.name || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      email: [
        this.data?.church?.email || '',
        [Validators.required, Validators.email],
      ],
      cnpj: [this.data?.church?.cnpj || '', [Validators.required]],
      cep: [this.data?.church?.cep || '', [Validators.required]],
      street: [
        this.data?.church?.street || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.church?.number || '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.church?.complement || '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.church?.district || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.church?.city || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.church?.state || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.church?.country || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      logo: [this.data?.church?.logo || ''],
      favicon: [this.data?.church?.favicon || ''],
      background: [this.data?.church?.background || ''],
      color: [this.data?.church?.color || ''],
      updated_at: [this.data?.church?.updated_at || ''],
    });
  };

  getErrorMessage(controlName: string): string | null {
    const control = this.churchForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit = () => {
    if (this.churchForm.invalid) {
      return;
    }

    const churchData = this.churchForm.value;
    this.isEditMode ? this.handleUpdate(churchData.id) : this.handleCreate();
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  handleCreate = () => {
    this.loading.show();
    this.churchsService.createChurch(this.churchForm.value).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(this.churchForm.value);
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.CREATE_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (churchId: string) => {
    this.loading.show();
    this.churchsService
      .updateChurch(churchId!, this.churchForm.value)
      .subscribe({
        next: () => {
          this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
          this.dialogRef.close(this.churchForm.value);
        },
        error: () => {
          this.loading.hide();
          this.toast.openError(MESSAGES.UPDATE_ERROR);
        },
        complete: () => this.loading.hide(),
      });
  };

  handleEditMode = () => {
    this.churchsService
      .getChurchById(this.churchId!)
      .subscribe((church: Church) => {
        this.churchForm.patchValue({
          ...church,
          updated_at: dayjs(church.updated_at).format('DD/MM/YYYY [às] HH:mm'),
        });
        this.responsible = church.responsible ? [church.responsible] : [];
      });
  };

  fetchResponsables() {
    this.churchsService.getResponsables().subscribe((responsables) => {
      this.responsible = responsables;
      this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterResponsables(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });
  }

  filterResponsables(searchTerm: string): Responsible[] {
    return this.responsible.filter((responsable) =>
      responsable.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  getResponsableName(): string {
    const responsibleId = this.churchForm.get('responsible_id')?.value;
    const responsible = this.responsible.find(
      (resp) => resp.id === responsibleId,
    );
    return responsible ? responsible.name : 'Selecione o responsável';
  }

  searchCep(cep: string): void {
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
