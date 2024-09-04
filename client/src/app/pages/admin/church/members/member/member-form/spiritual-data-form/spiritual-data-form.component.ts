import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingService } from 'app/components/loading/loading.service';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { MembersService } from '../../../members.service';

@Component({
  selector: 'app-spiritual-data-form',
  templateUrl: './spiritual-data-form.component.html',
  styleUrls: ['./spiritual-data-form.component.scss'],
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatCheckboxModule,
  ],
})
export class SpiritualDataFormComponent implements OnInit {
  memberForm: FormGroup;
  memberId: string | null = null;
  isEditMode: boolean = false;
  activeTabIndex: number = 0;
  persons: Person[] = [];

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    public navigationService: NavigationService
  ) {
    this.memberForm = this.fb.group({
      baptism_date: ['', [Validators.required]],
      baptism_locale: ['', [Validators.maxLength(255)]],
      baptism_official: ['', [Validators.maxLength(255)]],
      baptism_holy_spirit: [false],
      baptism_holy_spirit_date: [''],
      member_origin_id: ['', [Validators.required]],
      receipt_date: ['', [Validators.required]],
      updated_at: [''],
    });

    this.navigationService.activeTabIndex$.subscribe((index) => {
      this.activeTabIndex = index;
    });
  }

  ngOnInit() {}

  onCheckboxChange(fieldName: string, checkboxControlName: string): void {
    const isChecked = this.memberForm.get(checkboxControlName)?.value;
    if (!isChecked) {
      this.clearDate(fieldName);
    }
  }

  clearDate(fieldName: string): void {
    this.memberForm.get(fieldName)?.setValue(null);
  }

  getErrorMessage(controlName: string) {
    const control = this.memberForm.get(controlName);
    if (control) return this.validationService.getErrorMessage(control);
    return null;
  }

  handleBack = () => {
    this.core.handleBack();
  };

  handleSubmit = () => {
    if (this.memberForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateMember();
    }
  };

  handleEditMode = () => {
    this.loadingService.show();
    this.membersService
      .getMemberById(this.memberId!)
      .subscribe((member: Members) => {
        const formattedMembers = dayjs(member.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss'
        );

        this.memberForm.patchValue({
          ...member,
          updated_at: formattedMembers,
        });

        this.loadingService.hide();
      });
    this.loadingService.hide();
  };

  updateMember = () => {
    this.loadingService.show();
    this.membersService
      .updateMember(this.memberId!, this.memberForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess('Membro atualizado com sucesso.');
          this.core.handleBack();
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError(
            `Erro ao atualizar o membro. Verique os dados e tente novamente.`
          );
        },
      });
    this.loadingService.hide();
  };
}
