import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { Church, Responsables } from '../../../../../model/Church';
import { CepService } from '../../../../../service/SearchCEP/CepService.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { ChurchsService } from '../churchs.service';

@Component({
  selector: 'app-church',
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
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
    ChurchComponent,
    ColumnComponent,
  ],
  providers: [provideNgxMask()],
})
export class ChurchComponent implements OnInit {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  churchForm: FormGroup;
  churchId: string | null = null;
  isEditMode: boolean = false;
  searchControl = new FormControl();
  filteredResponsables$!: Observable<Responsables[]>;
  isSelectOpen = false;
  responsables: Responsables[] = [];
  selectedResponsableName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private churchsService: ChurchsService,
    private snackbarService: SnackbarService,
    private cepService: CepService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<ChurchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { church: Church },
  ) {
    this.churchForm = this.createForm();

    this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => this.filterResponsables(searchTerm ?? '')),
    );
  }

  ngOnInit() {
    this.fetchResponsables();

    if (this.data && this.data?.church) {
      this.isEditMode = true;
      this.churchId = this.data.church.id;
      this.churchForm.patchValue({
        ...this.data.church,
        responsible_id: this.data.church.responsible_id?.id || null,
      });
      this.handleEditMode();
    }

    this.churchForm.get('responsible_id')?.valueChanges.subscribe((id) => {
      const responsable = this.responsables.find((resp) => resp.id === id);
      this.selectedResponsableName =
        responsable?.name || 'Selecione o responsável';
    });

    if (this.isEditMode) {
      this.churchForm.get('cep')?.valueChanges.subscribe((cep: string) => {
        if (cep.length === 8) {
          this.searchCep(cep);
        }
      });
    }
  }

  createForm = () => {
    return this.fb.group({
      id: [this.data?.church?.id || ''],
      responsible_id: [
        this.data?.church?.responsible_id || '',
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

  get pageTitle(): string {
    return this.isEditMode ? 'Editando igreja' : 'Criando a Igreja';
  }

  getErrorMessage(controlName: string) {
    const control = this.churchForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit = () => {
    if (this.churchForm.invalid) {
      return;
    }

    const churchData = this.churchForm.value;
    if (this.isEditMode) {
      this.handleUpdate(churchData.id);
    } else {
      this.handleCreate();
    }
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  handleEditMode = () => {
    this.churchsService
      .getChurchById(this.churchId!)
      .subscribe((church: Church) => {
        this.churchForm.patchValue({
          ...church,
          updated_at: dayjs(church.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
          responsible_id: church.responsible_id || null,
        });
      });
  };

  handleCreate = () => {
    this.loadingService.show();
    this.churchsService.createChurch(this.churchForm.value).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Igreja criada com sucesso');
        this.dialogRef.close(this.churchForm.value);
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError('Erro ao criar a igreja');
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  };

  handleUpdate = (churchId: string) => {
    this.loadingService.show();
    this.churchsService
      .updateChurch(churchId!, this.churchForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Igreja atualizada com sucesso');
          this.dialogRef.close(this.churchForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError('Erro ao atualizar a igreja.');
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };

  fetchResponsables() {
    this.churchsService.getResponsables().subscribe({
      next: (responsables) => {
        this.responsables = responsables.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          startWith(''),
          map((searchTerm) => this.filterResponsables(searchTerm ?? '')),
        );

        // Patch form after responsables are loaded
        if (this.isEditMode) {
          this.churchForm.patchValue({
            responsible_id: this.data.church.responsible_id?.id || null,
          });
        }
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  }

  filterResponsables(searchTerm: string): Responsables[] {
    return this.responsables.filter((responsable) =>
      responsable.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  getResponsableName(): string {
    const responsibleId = this.churchForm.get('responsible_id')?.value;
    const responsible = this.responsables.find(
      (resp) => resp.id === responsibleId,
    );
    return (
      responsible?.name ||
      this.selectedResponsableName ||
      'Selecione o responsável'
    );
  }

  onSelectOpenedChange(isOpen: boolean) {
    if (isOpen) {
      this.fetchResponsables();
    }
  }

  searchCep(cep: string) {
    if (this.churchForm.get('cep')?.value?.length === '') {
      return;
    }

    this.loadingService.show();
    this.cepService.searchCep(cep).subscribe((data: any) => {
      if (data) {
        this.churchForm.patchValue({
          street: data.street || '',
          district: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        });
      }
      this.loadingService.hide();
    });
  }
}
