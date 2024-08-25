import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
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
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { CommonModule } from '@angular/common';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import dayjs from 'dayjs';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { CepService } from '../../../../../service/SearchCEP/CepService.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { cpfValidator } from '../../../../../utils/validators/cpf-validator';
import { phoneValidator } from '../../../../../utils/validators/phone-validator';
import { PersonsService } from '../persons.service';

type Sex = {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-person',
  standalone: true,
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
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
  ],
})
export class PersonComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private personService: PersonsService,
    private snackbarService: SnackbarService,
    private cepService: CepService,
    private loadingService: LoadingService
  ) {
    this.personForm = this.fb.group({
      user_id: [''],
      image: [''],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      cpf: ['', [Validators.required, cpfValidator()]],
      birth_date: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_one: ['', [Validators.required, phoneValidator()]],
      phone_two: ['', [phoneValidator()]],
      sex: ['', [Validators.required]],
      cep: ['', [Validators.required]],
      street: ['', [Validators.required, Validators.maxLength(255)]],
      number: ['', [Validators.required, Validators.maxLength(10)]],
      complement: ['', [Validators.maxLength(255)]],
      district: ['', [Validators.required, Validators.maxLength(255)]],
      city: ['', [Validators.required, Validators.maxLength(255)]],
      state: ['', [Validators.required, Validators.maxLength(255)]],
      country: ['', [Validators.required, Validators.maxLength(255)]],
      updated_at: [''],
    });
  }

  ngOnInit() {
    this.personId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.personId;
    if (this.isEditMode) {
      this.handleEditMode();
    }

    this.personForm.get('cep')?.valueChanges.subscribe((cep: string) => {
      if (cep.length === 8) {
        this.searchCep(cep);
      }
    });
  }

  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  personForm: FormGroup;
  isEditMode: boolean = false;
  personId: string | null = null;
  tooltipTextStatus: string = '';
  tooltipTextChangePassword: string = '';
  isLinear = false;
  sexs: Sex[] = [
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Feminino' },
  ];

  handleSubmit = () => {
    if (this.personForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate();
    } else {
      this.handleCreate();
    }
  };

  handleBack = () => {
    this.router.navigate(['/']);
  };

  handleEditMode = () => {
    this.personService.getPersonById(this.personId!).subscribe((person) => {
      const formattedUpdatedAt = person.updated_at
        ? dayjs(person.updated_at).format('DD/MM/YYYY HH:mm')
        : '';
      this.personForm.patchValue({
        ...person,
        updated_at: formattedUpdatedAt,
      });
    });
  };

  handleCreate = () => {
    this.personService.createPerson(this.personForm.value).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Pessoa criada com sucesso!');
        this.router.navigate(['/home']);
      },
      error: () => {
        this.snackbarService.openError('Erro ao criar a pessoa!');
      },
    });
  };

  handleUpdate = () => {
    const { updated_at, ...updatedPersonData } = this.personForm.value;
    this.personService
      .updatePerson(this.personId!, updatedPersonData)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Pessoa atualizada com sucesso!');
          this.router.navigate(['/home']);
        },
        error: () => {
          this.snackbarService.openError('Erro ao atualizar a pessoa!');
        },
      });
  };

  clearDate() {
    this.personForm.get('birth_date')?.setValue(null);
  }

  searchCep(cep: string) {
    this.loadingService.show();
    this.cepService.searchCep(cep).subscribe((data: any) => {
      if (data) {
        this.personForm.patchValue({
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
