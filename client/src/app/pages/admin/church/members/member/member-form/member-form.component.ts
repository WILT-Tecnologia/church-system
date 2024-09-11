import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { Church } from 'app/model/Church';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { ColorRace, EstadoCivil, Formation, Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { MembersService } from '../../members.service';
import { AdditionalDataFormComponent } from './additional-data-form/additional-data-form.component';
import { AddChurchDialogComponent } from './components/modal/add-church-dialog/add-church-dialog.component';
import { AddPersonDialogComponent } from './components/modal/add-person-dialog/add-person-dialog.component';
import { MemberStatusDataFormComponent } from './member-status-data-form/member-status-data-form.component';
import { MembershipDataFormComponent } from './membership-data-form/membership-data-form.component';
import { OrdinationDataFormComponent } from './ordination-data-form/ordination-data-form.component';
import { PersonalDataFormComponent } from './personal-data-form/personal-data-form.component';
import { SpiritualDataFormComponent } from './spiritual-data-form/spiritual-data-form.component';

type Selects = {
  value: string;
  viewValue: string;
};

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
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  memberId: string | null = null;
  isEditMode: boolean = false;
  memberForm: FormGroup;
  activeTabIndex: number = 0;
  searchControl = new FormControl();
  filteredPerson$: Observable<Person[]>;
  filteredChurch$: Observable<Church[]>;
  filterMemberOrigins: Observable<MemberOrigin[]>;
  isSelectOpen: boolean = true;
  persons: Person[] = [];
  churchs: Church[] = [];
  memberOrigins: MemberOrigin[] = [];

  colorRaceOptions: Selects[] = this.mapEnumToSelectOptions(ColorRace);
  civilStatusOptions: Selects[] = this.mapEnumToSelectOptions(EstadoCivil);
  formationOptions: Selects[] = this.mapEnumToSelectOptions(Formation);

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    private validationService: ValidationService,
    public navigationService: NavigationService
  ) {
    this.memberForm = this.createMemberForm();

    this.filteredPerson$ = this.setupSearchObservable('Person');
    this.filteredChurch$ = this.setupSearchObservable('Church');
    this.filterMemberOrigins = this.setupSearchObservable('MemberOrigin');

    this.navigationService.activeTabIndex$.subscribe((index) => {
      this.activeTabIndex = index;
    });
  }

  createMemberForm(): FormGroup {
    return this.fb.group({
      person_id: ['', [Validators.required]],
      church_id: ['', [Validators.required]],
      rg: ['', [Validators.required, Validators.maxLength(15)]],
      issuing_body: ['', [Validators.required, Validators.maxLength(255)]],
      civil_status: ['', [Validators.required]],
      color_race: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      naturalness: ['', [Validators.required]],
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
      baptism_date: [
        '',
        [this.validateBirthDate.bind(this), Validators.required],
      ],
      baptism_locale: ['', [Validators.maxLength(255), Validators.required]],
      baptism_official: ['', [Validators.maxLength(255), Validators.required]],
      baptism_holy_spirit: [false],
      baptism_holy_spirit_date: [''],
      member_origin_id: ['', [Validators.required]],
      receipt_date: ['', [Validators.required]],
      updated_at: [''],
    });
  }

  ngOnInit() {
    this.memberId = this.route.snapshot.paramMap.get('id');
    if (this.memberId) {
      this.isEditMode = true;
      this.handleEditMode();
    }
    this.loadInitialData();
  }

  createFilteredObservable(
    filterFunction: (searchTerm: string) => any[],
    sourceArray: any[]
  ): Observable<any[]> {
    return this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) =>
        filterFunction(searchTerm ?? '').sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      )
    );
  }

  setupSearchObservable(type: string): Observable<any[]> {
    return this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) =>
        (this as any)
          [`filter${type}`](searchTerm ?? '')
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
      )
    );
  }

  loadInitialData() {
    this.fetchData(this.membersService.getPersons(), 'persons');
    this.fetchData(this.membersService.getChurch(), 'churchs');
    this.fetchData(this.membersService.getMemberOrigins(), 'memberOrigins');
  }

  fetchData(fetchObservable: Observable<any[]>, target: string) {
    fetchObservable.subscribe((data) => {
      (this as any)[target] = data;
      (this as any)[
        `filtered${target.charAt(0).toUpperCase() + target.slice(1)}$`
      ] = this.setupSearchObservable(target.slice(0, -1));
    });
  }

  mapEnumToSelectOptions(enumObj: any): Selects[] {
    return Object.keys(enumObj).map((key) => ({
      value: enumObj[key as keyof typeof enumObj],
      viewValue: enumObj[key as keyof typeof enumObj],
    }));
  }

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
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleBack = () => {
    this.core.handleBack();
  };

  handleNextStep = () => {
    this.memberForm.valid
      ? this.navigationService.nextTab()
      : this.memberForm.markAllAsTouched();
  };

  handleSubmit() {
    if (this.memberForm.invalid) return;
    this.isEditMode ? this.updateMember() : this.createMember();
  }

  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const birthDate = control.value;
    if (!birthDate) return null;
    return dayjs(birthDate).isBefore(dayjs()) ? null : { invalidDate: true };
  }

  createMember() {
    this.loadingService.show();
    this.membersService.createMember(this.memberForm.value).subscribe({
      next: () => this.onSuccess('Membro criado com sucesso.'),
      error: () => this.onError('Erro ao criar o membro.'),
    });
  }

  handleEditMode = () => {
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
      });
  };

  updateMember() {
    this.loadingService.show();
    this.membersService
      .updateMember(this.memberId!, this.memberForm.value)
      .subscribe({
        next: () => this.onSuccess('Membro atualizado com sucesso.'),
        error: () => this.onError('Erro ao atualizar o membro.'),
      });
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.snackbarService.openSuccess(message);
    this.handleBack();
  }

  onError(message: string) {
    this.loadingService.hide();
    this.snackbarService.openError(message);
  }

  filterPerson(value: string): Person[] {
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  filterChurch(value: string): Church[] {
    return this.churchs.filter((church) =>
      church.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  filterMemberOrigin(value: string): MemberOrigin[] {
    return this.memberOrigins.filter((origin) =>
      origin.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  openAddPersonDialog(): void {
    this.dialog.open(AddPersonDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
  }

  openAddChurchDialog(): void {
    this.dialog.open(AddChurchDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
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

  getMemberOriginName(): string {
    const memberOriginId = this.memberForm.get('member_origin_id')?.value;
    if (memberOriginId) {
      const memberOrigin = this.memberOrigins.find(
        (r) => r.id === memberOriginId
      );
      return memberOrigin?.name ?? '';
    }
    return memberOriginId
      ? 'Selecione a origem do membro'
      : 'Selecione a origem do membro';
  }

  onSelectOpenedChangePerson(isOpen: boolean) {
    if (isOpen) {
      this.membersService.getPersons().subscribe((persons) => {
        this.persons = persons;
        this.filteredPerson$ = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          startWith(''),
          map((searchTerm) => this.filterPerson(searchTerm ?? ''))
        );
      });
    }
  }

  onSelectOpenedChangeChurch(isOpen: boolean) {
    if (isOpen) {
      this.membersService.getChurch().subscribe((churchs) => {
        this.churchs = churchs;
        this.filteredChurch$ = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          startWith(''),
          map((searchTerm) => this.filterChurch(searchTerm ?? ''))
        );
      });
    }
  }

  onSelectOpenedChangeMemberOrigin = (isOpen: boolean) => {
    if (isOpen) {
      this.membersService.getMemberOrigins().subscribe((memberOrigin) => {
        this.memberOrigins = memberOrigin.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.filterMemberOrigins = this.searchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterMemberOrigin(searchTerm ?? ''))
        );
      });
    }
  };
}
