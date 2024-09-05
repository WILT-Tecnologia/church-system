import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith } from 'rxjs';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { Responsables } from '../../../../../model/Church';
import { CoreService } from '../../../../../service/core/core.service';
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
  ],
  providers: [provideNgxMask()],
})
export class ChurchComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private core: CoreService,
    private churchsService: ChurchsService,
    private snackbarService: SnackbarService,
    private cepService: CepService,
    private loadingService: LoadingService
  ) {
    this.churchForm = this.fb.group({
      responsible_id: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      cnpj: ['', [Validators.required]],
      cep: ['', [Validators.required]],
      street: ['', [Validators.required, Validators.maxLength(255)]],
      number: ['', [Validators.required, Validators.maxLength(10)]],
      complement: ['', [Validators.maxLength(255)]],
      district: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(255)]],
      state: ['', [Validators.required, Validators.maxLength(255)]],
      country: ['', [Validators.required, Validators.maxLength(255)]],
      logo: [''],
      favicon: [''],
      background: [''],
      color: [''],
      updated_at: [''],
    });
    this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterResponsables(searchTerm ?? ''))
    );
  }

  ngOnInit() {
    this.fetchResponsables();
    this.churchId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.churchId;
    if (this.churchId) {
      this.handleEditMode();
    }

    if (!this.isEditMode) {
      this.churchForm.get('cep')?.valueChanges.subscribe((cep: string) => {
        if (cep.length === 8) {
          this.searchCep(cep);
        }
      });
    }
  }

  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  churchForm: FormGroup;
  isEditMode: boolean = false;
  churchId: string | null = null;
  searchControl = new FormControl('');
  filteredResponsables$!: Observable<Responsables[]>;
  isSelectOpen = false;
  responsables: Responsables[] = [];

  handleSubmit = () => {
    if (this.churchForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate();
    } else {
      this.handleCreate();
    }
  };

  get pageTitle(): string {
    return this.isEditMode
      ? `Editando a ogreja: ${this.churchForm.get('name')?.value || ''}`
      : `Cadastrar Igreja: ${this.churchForm.get('name')?.value || ''}`;
  }

  handleBack = () => {
    this.core.handleBack();
  };

  fetchResponsables() {
    this.churchsService.getResponsables().subscribe({
      next: (responsables) => {
        this.responsables = responsables.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterResponsables(searchTerm ?? ''))
        );
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  }

  filterResponsables(searchTerm: string): Responsables[] {
    return this.responsables.filter((responsable) =>
      responsable.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getResponsableName(): string {
    const responsableId = this.churchForm.get('responsible_id')?.value;
    if (responsableId) {
      const responsable = this.responsables.find((r) => r.id === responsableId);
      return responsable?.name ?? '';
    }
    return responsableId
      ? 'Selecione o responsável'
      : 'Selecione o responsável';
  }

  onSelectOpenedChange(isOpen: boolean) {
    if (isOpen) {
      this.fetchResponsables();
    }
  }

  handleEditMode = () => {
    this.churchsService.getChurchById(this.churchId!).subscribe((church) => {
      const formattedUpdatedAt = church.updated_at
        ? dayjs(church.updated_at).format('DD/MM/YYYY [às] HH:mm')
        : '';
      this.churchForm.patchValue({
        ...church,
        updated_at: formattedUpdatedAt,
      });
    });
  };

  handleCreate = () => {
    this.loadingService.show();
    this.churchsService.createChurch(this.churchForm.value).subscribe({
      next: () => {
        this.loadingService.hide();
        this.snackbarService.openSuccess('Igreja criada com sucesso');
        this.handleBack();
      },
      error: (error) => {
        this.loadingService.hide();
        this.snackbarService.openError(error.error.message);
      },
    });
  };

  handleUpdate = () => {
    this.loadingService.show();
    const { updated_at, ...updatedChurchData } = this.churchForm.value;
    this.churchsService
      .updateChurch(this.churchId!, updatedChurchData)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess('Igreja atualizada com sucesso');
          this.handleBack();
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(error.error.message);
        },
      });
  };

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
