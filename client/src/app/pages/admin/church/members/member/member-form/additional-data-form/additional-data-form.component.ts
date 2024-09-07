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
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingService } from 'app/components/loading/loading.service';
import { Formation, Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { MembersService } from '../../../members.service';

type Selects = {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-additional-data-form',
  templateUrl: './additional-data-form.component.html',
  styleUrls: ['./additional-data-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
  ],
})
export class AdditionalDataFormComponent implements OnInit {
  memberForm: FormGroup;
  memberId: string | null = null;
  isEditMode: boolean = false;
  activeTabIndex: number = 0;
  persons: Person[] = [];

  formationOptions: Selects[] = Object.keys(Formation).map((key) => ({
    value: Formation[key as keyof typeof Formation],
    viewValue: Formation[key as keyof typeof Formation],
  }));
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
      formation: [''],
      formation_course: [''],
      profission: [''],
      def_physical: [false],
      def_visual: [false],
      def_hearing: [false],
      def_intellectual: [false],
      def_mental: [false],
      def_multiple: [false],
      def_other: [false],
      def_other_description: ['', [Validators.maxLength(255)]],
      updated_at: [''],
    });

    this.navigationService.activeTabIndex$.subscribe((index) => {
      this.activeTabIndex = index;
    });
  }

  ngOnInit() {}

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
