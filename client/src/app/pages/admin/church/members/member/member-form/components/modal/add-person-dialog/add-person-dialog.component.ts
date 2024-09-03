import { CommonModule } from '@angular/common';
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
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MembersService } from 'app/pages/admin/church/members/members.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { cpfValidator } from 'app/utils/validators/cpf-validator';
import { phoneValidator } from 'app/utils/validators/phone-validator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

type Sex = {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-add-person-dialog',
  templateUrl: './add-person-dialog.component.html',
  styleUrls: ['./add-person-dialog.component.scss'],
  standalone: true,
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
export class AddPersonDialogComponent implements OnInit {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  addPersonForm: FormGroup;
  sexs: Sex[] = [
    { value: 'M', viewValue: 'Masculino' },
    { value: 'F', viewValue: 'Feminino' },
  ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPersonDialogComponent>,
    private membersService: MembersService,
    private snackbarService: SnackbarService
  ) {
    this.addPersonForm = this.fb.group({
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
    });
  }

  ngOnInit() {}

  addPerson() {
    if (this.addPersonForm.valid) {
      this.membersService.createPerson(this.addPersonForm.value).subscribe({
        next: () => {
          this.snackbarService.openSuccess('Pessoa adicionada com sucesso.');
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackbarService.openError('Erro ao adicionar pessoa.');
        },
      });
    }
  }

  clearDate() {
    this.addPersonForm.get('birth_date')?.setValue(null);
  }

  cancel() {
    this.dialogRef.close();
  }
}
