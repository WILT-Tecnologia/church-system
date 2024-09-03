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
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { Church } from 'app/model/Church';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith } from 'rxjs';
import { MembersService } from '../../members.service';
import { AdditionalDataFormComponent } from './additional-data-form/additional-data-form.component';
import { AddChurchDialogComponent } from './components/modal/add-church-dialog/add-church-dialog.component';
import { AddPersonDialogComponent } from './components/modal/add-person-dialog/add-person-dialog.component';
import { MemberStatusDataFormComponent } from './member-status-data-form/member-status-data-form.component';
import { MembershipDataFormComponent } from './membership-data-form/membership-data-form.component';
import { OrdinationDataFormComponent } from './ordination-data-form/ordination-data-form.component';
import { PersonalDataFormComponent } from './personal-data-form/personal-data-form.component';
import { SpiritualDataFormComponent } from './spiritual-data-form/spiritual-data-form.component';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
  imports: [
    MatTabsModule,
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    MatDatepickerModule,
    MatGridListModule,
    MemberFormComponent,
    PersonalDataFormComponent,
    AdditionalDataFormComponent,
    SpiritualDataFormComponent,
    MembershipDataFormComponent,
    OrdinationDataFormComponent,
    MemberStatusDataFormComponent,
  ],
})
export class MemberFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    private validationService: ValidationService
  ) {
    this.memberForm = this.fb.group({
      person_id: ['', [Validators.required]],
      church_id: ['', [Validators.required]],
      rg: ['', [Validators.required, Validators.maxLength(15)]],
      issuing_body: ['', [Validators.required, Validators.maxLength(255)]],
      civil_status: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      naturalness: ['', [Validators.required]],
      color_race: ['', [Validators.required]],
      formation: ['', [Validators.required]],
      formation_course: ['', [Validators.required, Validators.maxLength(255)]],
      profission: ['', [Validators.required, Validators.maxLength(255)]],
      def_physical: [false],
      def_visual: [false],
      def_hearing: [false],
      def_intellectual: [false],
      def_mental: [false],
      def_multiple: [false],
      def_other: [false],
      def_other_description: ['', [Validators.maxLength(255)]],
      baptism_date: ['', [Validators.required]],
      baptism_locale: ['', [Validators.maxLength(255)]],
      baptism_official: ['', [Validators.maxLength(255)]],
      baptism_holy_spirit: [false],
      baptism_holy_spirit_date: [''],
      member_origin_id: ['', [Validators.required]],
      receipt_date: ['', [Validators.required]],
      updated_at: [''],
    });

    this.filteredPerson$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterPerson(searchTerm ?? ''))
    );

    this.filteredChurch$ = this.searchChurchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterChurch(searchTerm ?? ''))
    );
  }

  ngOnInit() {
    this.fetchChurch();
    this.fetchPerson();
    this.memberId = this.route.snapshot.paramMap.get('id');
    if (this.memberId) {
      this.isEditMode = true;
      this.handleEditMode();
    }
  }
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  memberId: string | null = null;
  isEditMode: boolean = false;
  memberForm: FormGroup;
  searchControl = new FormControl();
  searchChurchControl = new FormControl();
  filteredPerson$: Observable<Person[]>;
  filteredChurch$: Observable<Church[]>;
  isSelectOpen: boolean = true;
  persons: Person[] = [];
  churchs: Church[] = [];

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

  openAddPersonModal() {
    const dialogRef = this.dialog.open(AddPersonDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchPerson();
      }
    });
  }

  openAddChurchModal() {
    const dialogRef = this.dialog.open(AddChurchDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchChurch();
      }
    });
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
    } else {
      this.createMember();
    }
  };

  createMember = () => {
    this.loadingService.show();
    this.membersService.createMember(this.memberForm.value).subscribe({
      next: () => {
        this.loadingService.hide();
        this.snackbarService.openSuccess('Membro criado com sucesso.');
        this.core.handleBack();
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError(
          'Erro ao criar o membro. Verifique os dados e tente novamente.'
        );
      },
    });
    this.loadingService.hide();
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
            `Erro ao atualizar o membro ${
              this.memberForm.get('name')?.value
            }. Tente novamente.`
          );
        },
      });
    this.loadingService.hide();
  };

  fetchPerson() {
    this.membersService.getPersons().subscribe({
      next: (person) => {
        this.persons = person.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredPerson$ = this.searchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterPerson(searchTerm ?? ''))
        );
      },
      error: () => {
        this.snackbarService.openError('Erro ao buscar a pessoa.');
      },
    });
  }

  fetchChurch() {
    this.membersService.getChurch().subscribe({
      next: (church) => {
        this.churchs = church.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredChurch$ = this.searchChurchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterChurch(searchTerm ?? ''))
        );
      },
      error: () => {
        this.snackbarService.openError('Erro ao buscar o igreja.');
      },
    });
  }

  filterPerson(searchTerm: string): Person[] {
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterChurch(searchTerm: string): Church[] {
    return this.churchs.filter((church) =>
      church.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getPersonName(): string {
    const personId = this.memberForm.get('person_id')?.value;
    if (personId) {
      const person = this.persons.find((r) => r.id === personId);
      return person?.name ?? '';
    }
    return personId ? 'Selecione a pessoa' : 'Selecione a pessoa';
  }

  getChurchName(): string {
    const churchId = this.memberForm.get('church_id')?.value;
    if (churchId) {
      const church = this.churchs.find((r) => r.id === churchId);
      return church?.name ?? '';
    }

    return churchId ? 'Selecione a igreja' : 'Selecione a igreja';
  }

  onSelectOpenedChangePerson(isOpen: boolean) {
    if (isOpen) {
      this.fetchPerson();
    }
  }

  onSelectOpenedChangeChurch(isOpen: boolean) {
    if (isOpen) {
      this.fetchChurch();
    }
  }
}
