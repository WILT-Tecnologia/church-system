import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { LoadingService } from 'app/components/loading/loading.service';
import {
  CivilStatus,
  ColorRace,
  Formations,
  Kinships,
  MemberSituations,
} from 'app/model/Auxiliaries';
import { Church } from 'app/model/Church';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { ChurchComponent } from 'app/pages/admin/administrative/churchs/church/church.component';
import { PersonComponent } from 'app/pages/admin/administrative/persons/person/person.component';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { ColumnComponent } from '../../../../../../components/column/column.component';
import { MembersService } from '../../members.service';

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
    ColumnComponent,
  ],
})
export class MemberFormComponent implements OnInit {
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  memberId: string | null = null;
  isEditMode: boolean = false;
  memberForm: FormGroup;

  searchControl = new FormControl('');
  searchCivilStatusControl = new FormControl('');
  searchColorRaceControl = new FormControl('');
  searchFormationsControl = new FormControl('');
  searchKinshipsControl = new FormControl('');
  searchMemberSituationsControl = new FormControl('');

  filteredPerson$: Observable<Person[]>;
  filteredChurch$: Observable<Church[]>;
  filterMemberOrigins: Observable<MemberOrigin[]>;
  filteredCivilStatus: Observable<CivilStatus[]>;
  filteredColorRace: Observable<ColorRace[]>;
  filteredFormations: Observable<Formations[]>;
  filteredKinships: Observable<Kinships[]>;
  filteredMemberSituations: Observable<MemberSituations[]>;

  persons: Person[] = [];
  churchs: Church[] = [];
  civilStatus: CivilStatus[] = [];
  colorRace: ColorRace[] = [];
  formations: Formations[] = [];
  kinships: Kinships[] = [];
  memberSituations: MemberSituations[] = [];
  memberOrigins: MemberOrigin[] = [];
  currentStep = 0;

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    public navigationService: NavigationService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MemberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: Members },
  ) {
    this.memberForm = this.createMemberForm();
    this.filteredPerson$ = this.setupSearchObservable('Person');
    this.filteredChurch$ = this.setupSearchObservable('Church');
    this.filteredColorRace = this.setupSearchObservable('color_race_id');
    this.filteredCivilStatus = this.setupSearchObservable('CivilStatus');
    this.filteredFormations = this.setupSearchObservable('Formations');
    this.filterMemberOrigins = this.setupSearchObservable('MemberOrigin');
    this.filteredKinships = this.setupSearchObservable('Kinships');
    this.filteredMemberSituations =
      this.setupSearchObservable('MemberSituations');

    this.navigationService.currentStep$.subscribe((index: number) => {
      this.currentStep = index;
    });
  }

  createMemberForm(): FormGroup {
    return this.fb.group({
      stepOne: this.fb.group({
        id: [this.data?.members?.id || ''],
        person_id: [this.data?.members?.person_id || '', [Validators.required]],
        church_id: [this.data?.members?.church_id || '', [Validators.required]],
        rg: [
          this.data?.members?.rg || '',
          [Validators.required, Validators.maxLength(15)],
        ],
        issuing_body: [
          this.data?.members?.issuing_body || '',
          [Validators.required, Validators.maxLength(255)],
        ],
        civil_status_id: [
          this.data?.members?.civil_status_id || '',
          [Validators.required],
        ],
        color_race_id: [
          this.data?.members?.color_race_id || '',
          [Validators.required],
        ],
        nationality: [
          this.data?.members?.nationality || '',
          [Validators.required],
        ],
        naturalness: [
          this.data?.members?.naturalness || '',
          [Validators.required],
        ],
        updated_at: [this.data?.members?.updated_at || ''],
      }),
      stepTwo: this.fb.group({
        formation_id: [
          this.data?.members?.formation_id || '',
          [Validators.required],
        ],
        formation_course: [
          this.data?.members?.formation_course || '',
          [Validators.required, Validators.maxLength(255)],
        ],
        profission: [
          this.data?.members?.profission || '',
          [Validators.required, Validators.maxLength(255)],
        ],
        def_physical: [this.data?.members?.def_physical || false],
        def_visual: [this.data?.members?.def_visual || false],
        def_hearing: [this.data?.members?.def_hearing || false],
        def_intellectual: [this.data?.members?.def_intellectual || false],
        def_mental: [this.data?.members?.def_mental || false],
        def_multiple: [this.data?.members?.def_multiple || false],
        def_other: [this.data?.members?.def_other || false],
        def_other_description: [
          this.data?.members?.def_other_description || '',
          [Validators.maxLength(255)],
        ],
        updated_at: [this.data?.members?.updated_at || ''],
      }),
      stepThree: this.fb.group({
        baptism_date: [
          this.data?.members?.baptism_date || '',
          [this.validateBirthDate.bind(this), Validators.required],
        ],
        baptism_locale: [
          this.data?.members?.baptism_locale || '',
          [Validators.maxLength(255), Validators.required],
        ],
        baptism_official: [
          this.data?.members?.baptism_official || '',
          [Validators.maxLength(255), Validators.required],
        ],
        baptism_holy_spirit: [this.data?.members.baptism_holy_spirit || false],
        baptism_holy_spirit_date: [
          this.data?.members.baptism_holy_spirit_date || '',
        ],
        member_origin_id: [
          this.data?.members.member_origin_id || '',
          [Validators.required],
        ],
        receipt_date: [
          this.data?.members.receipt_date || '',
          [Validators.required],
        ],
        updated_at: [this.data?.members.updated_at || ''],
      }),
    });
  }

  ngOnInit() {
    this.loadInitialData();
    if (this.data && this.data?.members) {
      this.isEditMode = true;
      this.memberId = this.data?.members?.id;
      this.memberForm.patchValue(this.data.members);
      this.handleEdit();
    }
  }

  setupSearchObservable(target: string): Observable<any[]> {
    return this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => {
        const items = (this as any)[target] || [];
        return items
          .filter((item: any) =>
            item.name.toLowerCase().includes(searchTerm?.toLowerCase()),
          )
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
    );
  }

  loadInitialData() {
    this.membersService.getPersons().subscribe((persons) => {
      this.persons = persons;
      this.filteredPerson$ = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterPerson(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });

    this.membersService.getChurch().subscribe((churchs) => {
      this.churchs = churchs;
      this.filteredChurch$ = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterChurch(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });

    this.membersService.getCivilStatus().subscribe((civilStatus) => {
      this.civilStatus = civilStatus;
      this.filteredCivilStatus = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterCivilStatus(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });

    this.membersService.getColorRace().subscribe((colorRace) => {
      this.colorRace = colorRace;
      this.filteredColorRace = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterColorRace(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });

    this.membersService.getFormations().subscribe((formations) => {
      this.formations = formations;
      this.filteredFormations = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterFormations(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });

    this.membersService.getMemberOrigins().subscribe((memberOrigin) => {
      this.memberOrigins = memberOrigin;
      this.filterMemberOrigins = this.searchControl.valueChanges.pipe(
        debounceTime(300),
        startWith(''),
        map((searchTerm) =>
          this.filterMemberOrigin(searchTerm ?? '').sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        ),
      );
    });
    //this.fetchData(this.membersService.getKinships(), 'kinships');
    /* this.fetchData(
      this.membersService.getMemberSituations(),
      'memberSitations',
    ); */
  }

  fetchData(serviceMethod: Observable<any>, target: string) {
    return serviceMethod.subscribe((data) => {
      (this as any)[target] = data;
    });
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
    this.dialogRef.close();
  };

  onNext() {
    const currentStepFormGroup = this.getCurrentStepFormGroup();

    if (currentStepFormGroup.valid) {
      if (this.currentStep < 2) {
        this.currentStep++;
      }
    } else {
      currentStepFormGroup.markAllAsTouched();
    }
  }

  onBack() {
    this.currentStep > 0 ? this.currentStep-- : this.handleBack();
  }

  getCurrentStepFormGroup(): FormGroup {
    switch (this.currentStep) {
      case 0:
        return this.memberForm.get('stepOne') as FormGroup;
      case 1:
        return this.memberForm.get('stepTwo') as FormGroup;
      case 2:
        return this.memberForm.get('stepThree') as FormGroup;
      default:
        return this.memberForm.get('stepOne') as FormGroup;
    }
  }

  canProceedToNextStep(): boolean {
    const currentStepGroup = this.getCurrentStepFormGroup();
    return currentStepGroup ? currentStepGroup.valid : false;
  }

  combineStepData() {
    const stepOneData = this.memberForm.get('stepOne')?.value;
    const stepTwoData = this.memberForm.get('stepTwo')?.value;
    const stepThreeData = this.memberForm.get('stepThree')?.value;

    const combinedData = {
      ...stepOneData,
      ...stepTwoData,
      ...stepThreeData,
    };

    return combinedData;
  }

  handleSubmit() {
    if (this.memberForm.invalid) return;

    const memberData = this.combineStepData();
    this.isEditMode ? this.updateMember(memberData.id) : this.handleCreate();
  }

  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const selectedDate = control.value;
    const currentDate = dayjs();
    if (selectedDate && dayjs(selectedDate).isAfter(currentDate)) {
      return { futureDate: true };
    }
    return null;
  }

  handleCreate() {
    this.loadingService.show();

    const memberData = this.combineStepData();
    this.membersService.createMember(memberData).subscribe({
      next: () => this.onSuccess('Membro criado com sucesso.'),
      error: () => this.onError('Erro ao criar o membro.'),
      complete: () => this.loadingService.hide(),
    });
  }

  handleEdit = () => {
    this.membersService
      .getMemberById(this.memberId!)
      .subscribe((member: Members) => {
        this.memberForm.patchValue({
          ...member,
          updated_at: dayjs(member.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
      });
  };

  updateMember(memberId: string) {
    this.loadingService.show();
    this.membersService
      .updateMember(memberId!, this.memberForm.value)
      .subscribe({
        next: () => this.onSuccess('Membro criado com sucesso.'),
        error: () => this.onError('Erro ao criar o membro.'),
        complete: () => this.loadingService.hide(),
      });
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.snackbarService.openSuccess(message);
    this.dialogRef.close(this.memberForm.value);
  }

  onError(message: string) {
    this.loadingService.hide();
    this.snackbarService.openError(message);
  }

  filterPerson(value: string): Person[] {
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterChurch(value: string): Church[] {
    return this.churchs.filter((church) =>
      church.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterMemberOrigin(value: string): MemberOrigin[] {
    return this.memberOrigins.filter((origin) =>
      origin.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterCivilStatus(value: string): CivilStatus[] {
    const filterValue = value.toLowerCase();
    return this.civilStatus.filter((option) =>
      option.name.toLowerCase().includes(filterValue),
    );
  }

  filterColorRace(value: string): ColorRace[] {
    return this.colorRace.filter((colorRace) =>
      colorRace.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterFormations(value: string): Formations[] {
    return this.formations.filter((formation) =>
      formation.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  openAddPersonDialog(): void {
    this.dialog.open(PersonComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
  }

  openAddChurchDialog(): void {
    this.dialog.open(ChurchComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
  }

  getPersonName(): string {
    const personId = this.memberForm.get('stepOne.person_id')?.value;
    if (personId) {
      const person = this.persons.find((r) => r.id === personId);
      return person?.name ?? 'Selecione a pessoa';
    }
    return 'Selecione a pessoa';
  }

  getChurchName(): string {
    const churchId = this.memberForm.get('stepOne.church_id')?.value;
    if (churchId) {
      const church = this.churchs.find((r) => r.id === churchId);
      return church?.name ?? 'Selecione a igreja';
    }

    return 'Selecione a igreja';
  }

  getCivilStatusName(): string {
    const civilStatusId = this.memberForm.get('stepOne.civil_status_id')?.value;
    if (civilStatusId) {
      const civilStatus = this.civilStatus.find((r) => r.id === civilStatusId);
      return civilStatus?.name ?? 'Selecione o estado civil';
    }
    return 'Selecione o estado civil';
  }

  getColorRaceName(): string {
    const colorRaceId = this.memberForm.get('stepOne.color_race_id')?.value;
    if (colorRaceId) {
      const colorRace = this.colorRace.find((r) => r.id === colorRaceId);
      return colorRace?.name ?? 'Selecione a cor/raça';
    }
    return 'Selecione a cor/raça';
  }

  getMemberOriginName(): string {
    const memberOriginId = this.memberForm.get(
      'stepThree.member_origin_id',
    )?.value;
    if (memberOriginId) {
      const memberOrigin = this.memberOrigins.find(
        (r) => r.id === memberOriginId,
      );
      return memberOrigin?.name ?? 'Selecione a origem do membro';
    }
    return 'Selecione a origem do membro';
  }

  getFormationsName(): string {
    const formationId = this.memberForm.get('stepTwo.formation_id')?.value;
    if (formationId) {
      const formation = this.formations.find((r) => r.id === formationId);
      return formation?.name ?? 'Selecione a formação';
    }
    return 'Selecione a formação';
  }
}
