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
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
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
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
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
import { ActionsComponent } from '../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { MESSAGES } from '../../../../../components/toast/messages';
import { ToastService } from '../../../../../components/toast/toast.service';
import { Address } from '../../../../../model/Address';
import { Church } from '../../../../../model/Church';
import { Person } from '../../../../../model/Person';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { SanitizeValuesService } from '../../../../../services/sanitize/sanitize-values.service';
import { CepService } from '../../../../../services/search-cep/search-cep.service';
import { ValidationService } from '../../../../../services/validation/validation.service';
import { cnpjValidator } from '../../../../../services/validators/cnpj-validator';
import { PersonsService } from '../../persons/persons.service';
import { ChurchsService } from '../churchs.service';

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
        ActionsComponent,
    ],
    providers: [provideNgxMask()]
})
export class ChurchComponent implements OnInit, OnDestroy {
  churchForm: FormGroup;
  church: Church[] = [];
  responsible: Person[] = [];
  isEditMode: boolean = false;

  searchResponsibleControl = new FormControl('');
  filterResponsable: Observable<Person[]> = new Observable<Person[]>();

  private destroy$ = new Subject<void>();
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  constructor(
    private personService: PersonsService,
    private churchsService: ChurchsService,
    private fb: FormBuilder,
    private toast: ToastService,
    private cepService: CepService,
    private loading: LoadingService,
    private validationService: ValidationService,
    private sanitize: SanitizeValuesService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<ChurchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { church: Church },
  ) {
    this.churchForm = this.createForm();
  }

  ngOnInit() {
    this.checkEditMode();
    this.loadResponsibles();
    this.initialSearchCep();
    this.initialFilterResponsibles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadResponsibles() {
    this.personService.getPersons().subscribe({
      next: (res) => {
        this.responsible = res;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private checkEditMode() {
    if (this.data?.church) {
      this.isEditMode = true;

      if (this.data?.church?.responsible) {
        this.searchResponsibleControl.setValue(
          this.data.church.responsible.name,
        );
        this.churchForm
          .get('responsible_id')
          ?.setValue(this.data.church.responsible.id);
      }

      this.churchForm.patchValue({
        ...this.data.church,
        responsible_id: this.data.church.responsible?.id,
      });
    }
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.church?.id ?? ''],
      responsible_id: [
        this.data?.church?.responsible?.id ?? '',
        [Validators.required],
      ],
      name: [
        this.data?.church?.name ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      email: [
        this.data?.church?.email ?? '',
        [Validators.required, Validators.email],
      ],
      cnpj: [
        this.data?.church?.cnpj ?? '',
        [Validators.required, cnpjValidator],
      ],
      cep: [this.data?.church?.cep ?? '', [Validators.required]],
      street: [
        this.data?.church?.street ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.church?.number ?? '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.church?.complement ?? '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.church?.district ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.church?.city ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.church?.state ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.church?.country ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      logo: [this.data?.church?.logo ?? ''],
      favicon: [this.data?.church?.favicon ?? ''],
      background: [this.data?.church?.background ?? ''],
      color: [this.data?.church?.color ?? ''],
    });
  };

  showAllResponsibles = () => {
    this.filterResponsable = this.searchResponsibleControl.valueChanges.pipe(
      debounceTime(300),
      startWith(this.searchResponsibleControl.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this._filterResponsables(name) : this.responsible,
      ),
    );
  };

  private initialFilterResponsibles() {
    this.filterResponsable = this.searchResponsibleControl.valueChanges.pipe(
      debounceTime(300),
      startWith(this.searchResponsibleControl.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this._filterResponsables(name) : this.responsible,
      ),
    );
  }

  private _filterResponsables(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.responsible.filter((responsible) =>
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

  handleSubmit = () => {
    const church = this.churchForm.value;

    if (!church) {
      return;
    }

    const sanitizeChurchValues = this.sanitize.sanitizeInput(church);

    if (this.isEditMode) {
      this.handleUpdate(sanitizeChurchValues.id, sanitizeChurchValues);
    } else {
      this.handleCreate(sanitizeChurchValues);
    }
  };

  handleNext = () => {
    this.tabGroup.selectedIndex = 1;
  };

  handleBack = () => {
    this.tabGroup.selectedIndex = 0;
  };

  handleCancel() {
    this.dialogRef.close();
  }

  handleCreate = (data: any) => {
    this.loading.show();
    this.churchsService.createChurch(data).subscribe({
      next: () => {
        this.notificationService.onSuccess(
          MESSAGES.CREATE_SUCCESS,
          this.dialogRef,
          this.churchForm.value,
        );
      },
      error: () => {
        this.notificationService.onError(MESSAGES.CREATE_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  handleUpdate = (churchId: string, data: any) => {
    this.loading.show();
    this.churchsService.updateChurch(churchId, data).subscribe({
      next: () => {
        this.notificationService.onSuccess(
          MESSAGES.CREATE_SUCCESS,
          this.dialogRef,
          this.churchForm.value,
        );
      },
      error: () => {
        this.notificationService.onError(MESSAGES.CREATE_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  initialSearchCep() {
    let previousCepValue = this.churchForm.get('cep')?.value;

    this.churchForm
      .get('cep')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((cep: string) => {
        if (cep.length === 8 && cep !== previousCepValue) {
          this.searchCep(cep);
        }
        previousCepValue = cep;
      });
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
