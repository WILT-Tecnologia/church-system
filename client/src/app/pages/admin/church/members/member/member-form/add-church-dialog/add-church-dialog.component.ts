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
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith } from 'rxjs';
import { LoadingService } from '../../../../../../../components/loading/loading.service';
import { Responsables } from '../../../../../../../model/Church';
import { CoreService } from '../../../../../../../service/core/core.service';
import { CepService } from '../../../../../../../service/SearchCEP/CepService.service';
import { SnackbarService } from '../../../../../../../service/snackbar/snackbar.service';
import { ChurchsService } from '../../../../../administrative/churchs/churchs.service';
import { ChurchComponent } from '../../../../church.component';

@Component({
  selector: 'app-add-church-dialog',
  templateUrl: './add-church-dialog.component.html',
  styleUrls: ['./add-church-dialog.component.scss'],
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
export class AddChurchDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private core: CoreService,
    private churchsService: ChurchsService,
    private snackbarService: SnackbarService,
    private cepService: CepService,
    private loadingService: LoadingService,
    private dialog: MatDialog
  ) {
    this.churchForm = this.fb.group({
      responsible_id: [''],
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
    });
    this.filteredResponsables$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterResponsables(searchTerm ?? ''))
    );
  }

  ngOnInit() {
    this.fetchResponsables();
    this.churchId = this.route.snapshot.paramMap.get('id');

    this.churchForm.get('cep')?.valueChanges.subscribe((cep: string) => {
      if (cep.length === 8) {
        this.searchCep(cep);
      }
    });
  }

  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  churchForm: FormGroup;
  churchId: string | null = null;
  searchControl = new FormControl('');
  filteredResponsables$!: Observable<Responsables[]>;
  isSelectOpen = false;
  responsables: Responsables[] = [];

  handleSubmit = () => {
    this.handleCreate();
  };

  handleBack() {
    this.dialog.closeAll();
  }

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
    return 'Selecione o responsável';
  }

  onSelectOpenedChange(isOpen: boolean) {
    this.isSelectOpen = isOpen;
  }

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
        this.snackbarService.openError(
          'Erro ao criar igreja. Verifique os dados e tente novamente'
        );
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
