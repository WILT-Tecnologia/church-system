import {
  ChangeDetectionStrategy,
  Component,
  Inject,
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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { CommonModule } from '@angular/common';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from 'app/components/column/column.component';
import { Person } from 'app/model/Person';
import { ValidationService } from 'app/service/validation/validation.service';
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
    ColumnComponent,
  ],
})
export class PersonComponent implements OnInit {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  personForm: FormGroup;
  isEditMode: boolean = false;
  personId: string | null = null;
  tooltipTextStatus: string = '';
  tooltipTextChangePassword: string = '';
  sexs: Sex[] = [
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Feminino' },
  ];

  constructor(
    private fb: FormBuilder,
    private personService: PersonsService,
    private snackbarService: SnackbarService,
    private cepService: CepService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<PersonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { person: Person },
  ) {
    this.personForm = this.createForm();
  }

  ngOnInit() {
    if (this.data && this.data?.person) {
      this.isEditMode = true;
      this.personId = this.data.person.id;
      this.personForm.patchValue(this.data.person);
      this.handleEditMode();
    }

    if (this.isEditMode) {
      this.personForm.get('cep')?.valueChanges.subscribe((cep: string) => {
        if (cep.length === 8) {
          this.searchCep(cep);
        }
      });
    }
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.person?.id || ''],
      user_id: [this.data?.person?.user_id || ''],
      image: [this.data?.person?.image || ''],
      name: [
        this.data?.person?.name || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      cpf: [
        this.data?.person?.cpf || '',
        [Validators.required, cpfValidator()],
      ],
      birth_date: [this.data?.person?.birth_date || '', [Validators.required]],
      email: [
        this.data?.person?.email || '',
        [Validators.required, Validators.email],
      ],
      phone_one: [
        this.data?.person?.phone_one || '',
        [Validators.required, phoneValidator()],
      ],
      phone_two: [this.data?.person?.phone_two || '', [phoneValidator()]],
      sex: [this.data?.person?.sex || '', [Validators.required]],
      cep: [this.data?.person?.cep || '', [Validators.required]],
      street: [
        this.data?.person?.street || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      number: [
        this.data?.person?.number || '',
        [Validators.required, Validators.maxLength(10)],
      ],
      complement: [
        this.data?.person?.complement || '',
        [Validators.maxLength(255)],
      ],
      district: [
        this.data?.person?.district || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      city: [
        this.data?.person?.city || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      state: [
        this.data?.person?.state || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      country: [
        this.data?.person?.country || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      updated_at: [this.data?.person?.updated_at || ''],
    });
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editando pessoa' : 'Criando pessoa';
  }

  getErrorMessage(controlName: string) {
    const control = this.personForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit = () => {
    if (this.personForm.invalid) {
      return;
    }

    const personData = this.personForm.value;
    if (this.isEditMode) {
      this.handleUpdate(personData.id);
    } else {
      this.handleCreate();
    }
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  handleCreate = () => {
    this.loadingService.show();
    this.personService.createPerson(this.personForm.value).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Pessoa criada com sucesso!');
        this.dialogRef.close(this.personForm.value);
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError('Erro ao criar a pessoa!');
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  };

  handleUpdate = (personId: string) => {
    this.loadingService.show();
    this.personService
      .updatePerson(personId!, this.personForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Pessoa atualizada com sucesso!');
          this.dialogRef.close(this.personForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError('Erro ao atualizar a pessoa!');
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };

  handleEditMode = () => {
    this.personService
      .getPersonById(this.personId!)
      .subscribe((person: Person) => {
        this.personForm.patchValue({
          ...person,
          updated_at: dayjs(person.updated_at).format('DD/MM/YYYY [às] HH:mm'),
        });
      });
  };

  clearDate() {
    this.personForm.get('birth_date')?.setValue(null);
  }

  searchCep(cep: string) {
    if (this.personForm.get('cep')?.value?.length === '') {
      return;
    }

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
