import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
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
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CivilStatus, ColorRace, Formations } from 'app/model/Auxiliaries';
import { Church } from 'app/model/Church';
import { Families } from 'app/model/Families';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { History, Members, StatusMember } from 'app/model/Members';
import { Ordination } from 'app/model/Ordination';
import { Person } from 'app/model/Person';
import { NavigationService } from 'app/services/navigation/navigation.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith, Subject } from 'rxjs';
import { ChurchComponent } from '../../../administrative/churchs/church/church.component';
import { PersonComponent } from '../../../administrative/persons/person/person.component';
import { MembersService } from '../members.service';
import { FamiliesComponent } from '../shared/families/families.component';
import { HistoryService } from '../shared/history/history.service';
import { OrdinationsComponent } from '../shared/ordinations/ordinations.component';
import { StatusMemberComponent } from '../shared/status-member/status-member.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideNativeDateAdapter(),
    provideNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  imports: [
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatRadioModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
    FamiliesComponent,
    MatDialogModule,
    OrdinationsComponent,
    StatusMemberComponent,
    ActionsComponent,
    MatTooltipModule,
  ],
})
export class MemberComponent implements OnInit, OnDestroy {
  memberForm: FormGroup;
  isEditMode: boolean = false;
  isInitialStepCompleted = false;
  enableDefinitionForm = signal(false);
  currentStep = 0;
  isFormationCourseVisible: boolean = false;
  formationsRequiringCourse: string[] = ['08', '09', '10', '11', '12'];

  searchControlPerson = new FormControl('');
  searchControlChurch = new FormControl('');
  searchControlCivilStatus = new FormControl('');
  searchControlColorRace = new FormControl('');
  searchControlFormations = new FormControl('');
  searchControlMemberOrigins = new FormControl('');

  filteredPerson: Observable<Person[]> = new Observable<Person[]>();
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();
  filterMemberOrigins: Observable<MemberOrigin[]> = new Observable<
    MemberOrigin[]
  >();
  filteredCivilStatus: Observable<CivilStatus[]> = new Observable<
    CivilStatus[]
  >();
  filteredColorRace: Observable<ColorRace[]> = new Observable<ColorRace[]>();
  filteredFormations: Observable<Formations[]> = new Observable<Formations[]>();

  members: Members[] = [];
  persons: Person[] = [];
  churchs: Church[] = [];
  civilStatus: CivilStatus[] = [];
  colorRace: ColorRace[] = [];
  formations: Formations[] = [];
  families: Families[] = [];
  ordinations: Ordination[] = [];
  status_member: StatusMember[] = [];
  memberOrigins: MemberOrigin[] = [];
  history: History[] = [];

  private readonly _currentDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(this._currentDate);
  private destroy$ = new Subject<void>();
  @ViewChild('baptism_date') baptismPicker!: MatDatepicker<Date>;
  @ViewChild('baptism_holy_spirit_date')
  baptismHolySpiritPicker!: MatDatepicker<Date>;
  @ViewChild('receipt_date') receiptDatePicker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private historyService: HistoryService,
    private membersService: MembersService,
    private notification: NotificationService,
    private loading: LoadingService,
    private validationService: ValidationService,
    public navigationService: NavigationService,
    private modalService: ModalService,
    private dialogRef: MatDialogRef<MemberComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { members: Members },
  ) {
    this.memberForm = this.createMemberForm();

    this.navigationService.currentStep$.subscribe((index: number) => {
      this.currentStep = index;
    });
  }

  ngOnInit() {
    this.loadInitialData();
    this.handleEdit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createMemberForm = (): FormGroup =>
    this.fb.group({
      stepOne: this.fb.group({
        id: [this.data?.members?.id || ''],
        person_id: [
          this.data?.members?.person?.id || '',
          [Validators.required],
        ],
        church_id: [
          this.data?.members?.church?.id || '',
          [Validators.required],
        ],
        rg: [
          this.data?.members?.rg || '',
          [Validators.required, Validators.maxLength(15)],
        ],
        issuing_body: [
          this.data?.members?.issuing_body || '',
          [Validators.required, Validators.maxLength(255)],
        ],
        civil_status_id: [
          this.data?.members?.civil_status?.id || '',
          [Validators.required],
        ],
        color_race_id: [
          this.data?.members?.color_race?.id || '',
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
      }),

      stepTwo: this.fb.group({
        formation_id: [
          this.data?.members?.formation?.id || '',
          [Validators.required],
        ],
        formation_course: [
          this.data?.members?.formation_course || '',
          [Validators.maxLength(255)],
        ],
        profission: [
          this.data?.members?.profission || '',
          [Validators.maxLength(255)],
        ],
        has_disability: [false],
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
      }),

      stepThree: this.fb.group({
        baptism_date: [this.data?.members?.baptism_date || ''],
        baptism_locale: [
          this.data?.members?.baptism_locale || '',
          [Validators.maxLength(255)],
        ],
        baptism_official: [
          this.data?.members?.baptism_official || '',
          [Validators.maxLength(255)],
        ],
        baptism_holy_spirit: [this.data?.members?.baptism_holy_spirit || false],
        baptism_holy_spirit_date: [
          this.data?.members?.baptism_holy_spirit_date || '',
        ],
        member_origin_id: [
          this.data?.members?.member_origin?.id || '',
          [Validators.required],
        ],
        receipt_date: [this.data?.members?.receipt_date || ''],
      }),

      stepFour: this.fb.group({}),

      stepFive: this.fb.group({}),

      stepSix: this.fb.group({}),
    });

  showLoading = () => {
    this.loading.show();
  };

  hideLoading = () => {
    this.loading.hide();
  };

  private loadInitialData() {
    this.membersService.getPersons().subscribe({
      next: (persons) => {
        this.persons = persons;
        this.showAllPerson();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });

    this.membersService.getChurch().subscribe({
      next: (churchs) => {
        this.churchs = churchs;
        this.showAllChurch();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });

    this.membersService.getCivilStatus().subscribe({
      next: (civilStatus) => {
        this.civilStatus = civilStatus;
        this.showAllCivilStatus();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });

    this.membersService.getColorRace().subscribe({
      next: (colorRace) => {
        this.colorRace = colorRace;
        this.showAllColorRace();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });

    this.membersService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations;
        this.showAllFormations();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });

    this.membersService.getMemberOrigins().subscribe({
      next: (memberOrigin) => {
        this.memberOrigins = memberOrigin;
        this.showAllMemberOrigins();
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  showAllPerson() {
    this.filteredPerson = this.searchControlPerson.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this.filterPerson(name) : this.persons,
      ),
    );
  }

  showAllChurch() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this.filterChurch(name) : this.churchs,
      ),
    );
  }

  showAllCivilStatus() {
    this.filteredCivilStatus = this.searchControlCivilStatus.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this.filterCivilStatus(name) : this.civilStatus,
      ),
    );
  }

  showAllColorRace() {
    this.filteredColorRace = this.searchControlColorRace.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this.filterColorRace(name) : this.colorRace,
      ),
    );
  }

  showAllFormations() {
    this.filteredFormations = this.searchControlFormations.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name.length >= 1 ? this.filterFormations(name) : this.formations,
      ),
    );
  }

  showAllMemberOrigins() {
    this.filterMemberOrigins =
      this.searchControlMemberOrigins.valueChanges.pipe(
        startWith(''),
        map((value: any) => {
          if (typeof value === 'string') {
            return value;
          } else {
            return value ? value.name : '';
          }
        }),
        map((name) =>
          name.length >= 1 ? this.filterMemberOrigin(name) : this.memberOrigins,
        ),
      );
  }

  filterPerson(name: string): Person[] {
    const value = name.toLowerCase();
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(value),
    );
  }

  filterChurch = (name: string): Church[] => {
    const value = name.toLowerCase();
    return this.churchs.filter((church) =>
      church.name.toLowerCase().includes(value),
    );
  };

  filterMemberOrigin(name: string): MemberOrigin[] {
    const value = name.toLowerCase();
    return this.memberOrigins.filter((origin) =>
      origin.name.toLowerCase().includes(value),
    );
  }

  filterCivilStatus(name: string): CivilStatus[] {
    const value = name.toLowerCase();
    return this.civilStatus.filter((option) =>
      option.name.toLowerCase().includes(value),
    );
  }

  filterColorRace(name: string): ColorRace[] {
    const value = name.toLowerCase();
    return this.colorRace.filter((colorRace) =>
      colorRace.name.toLowerCase().includes(value),
    );
  }

  filterFormations(name: string): Formations[] {
    const value = name.toLowerCase();
    return this.formations.filter((formation) =>
      formation.name.toLowerCase().includes(value),
    );
  }

  onPersonSelected(event: MatAutocompleteSelectedEvent) {
    const selectedPerson = event.option.value;
    this.searchControlPerson.setValue(selectedPerson.name);
    this.memberForm.get('stepOne.person_id')?.setValue(selectedPerson.id);
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const selectedChurch = event.option.value;
    this.searchControlChurch.setValue(selectedChurch.name);
    this.memberForm.get('stepOne.church_id')?.setValue(selectedChurch.id);
  }

  onCivilStatusSelected(event: MatAutocompleteSelectedEvent) {
    const selectedCivilStatus = event.option.value;
    this.searchControlCivilStatus.setValue(selectedCivilStatus.name);
    this.memberForm
      .get('stepOne.civil_status_id')
      ?.setValue(selectedCivilStatus.id);
  }

  onColorRaceSelected(event: MatAutocompleteSelectedEvent) {
    const selectedColorRace = event.option.value;
    this.searchControlColorRace.setValue(selectedColorRace.name);
    this.memberForm
      .get('stepOne.color_race_id')
      ?.setValue(selectedColorRace.id);
  }

  onFormationsSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFormations = event.option.value;
    this.searchControlFormations.setValue(selectedFormations.name);
    this.memberForm
      .get('stepTwo.formation_id')
      ?.setValue(selectedFormations.id);
    this.onFormationChange(selectedFormations.id, this.formations);
  }

  onMemberOriginSelected(event: MatAutocompleteSelectedEvent) {
    const selectedMemberOrigin = event.option.value;
    this.searchControlMemberOrigins.setValue(selectedMemberOrigin.name);
    this.memberForm
      .get('stepThree.member_origin_id')
      ?.setValue(selectedMemberOrigin.id);
  }

  clearDate(fieldName: string) {
    this.memberForm.get(fieldName)?.reset();
  }

  onCheckboxChange(fieldName: string, checkboxControlName: string) {
    const isChecked = this.memberForm.get(checkboxControlName)?.value;
    if (!isChecked) {
      this.memberForm.get(fieldName)?.reset(null);
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.memberForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  isTabDisabled(tabIndex: number): boolean {
    if (this.isInitialStepCompleted && tabIndex >= 3) {
      return false;
    }

    if (this.isEditMode) {
      return false;
    }

    return this.currentStep !== tabIndex;
  }

  onBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
    } else {
      this.handleBack();
    }
  }

  onNext() {
    const stepForm = this.getCurrentStepFormGroup(this.currentStep);

    if (stepForm && stepForm.valid) {
      this.currentStep++;
    } else {
      stepForm.markAsTouched();
      this.toast.openError('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  canProceedToNextStep(): boolean {
    const currentStepGroup = this.getCurrentStepFormGroup();
    return currentStepGroup ? currentStepGroup.valid : false;
  }

  getCurrentStepFormGroup(stepIndex?: number): FormGroup {
    switch (stepIndex) {
      case 0:
        return this.memberForm.get('stepOne') as FormGroup;
      case 1:
        return this.memberForm.get('stepTwo') as FormGroup;
      case 2:
        return this.memberForm.get('stepThree') as FormGroup;
      case 3:
        return this.memberForm.get('stepFour') as FormGroup;
      case 4:
        return this.memberForm.get('stepFive') as FormGroup;
      case 5:
        return this.memberForm.get('stepSix') as FormGroup;
      default:
        return this.memberForm.get('stepOne') as FormGroup;
    }
  }

  combineStepData() {
    const stepOneData = this.memberForm.get('stepOne')?.value;
    const stepTwoData = this.memberForm.get('stepTwo')?.value;
    const stepThreeData = this.memberForm.get('stepThree')?.value;
    const stepFourData = this.memberForm.get('stepFour')?.value;
    const stepFiveData = this.memberForm.get('stepFive')?.value;
    const stepSixData = this.memberForm.get('stepSix')?.value;

    return {
      ...stepOneData,
      ...stepTwoData,
      ...stepThreeData,
      ...stepFourData,
      ...stepFiveData,
      ...stepSixData,
    };
  }

  handleBack() {
    this.dialogRef.close(this.memberForm.value);
  }

  handleSubmit() {
    if (this.memberForm.invalid) return;

    const memberData = this.combineStepData();
    if (this.isEditMode) {
      this.handleUpdate(memberData.id);
    } else {
      this.handleCreate();
    }
  }

  finalizeStepThree() {
    if (this.memberForm.get('stepThree')?.valid) {
      const stepThreeData = this.memberForm.get('stepThree')?.value;

      const familyData = this.families;
      const ordinationData = this.ordinations;
      const statusMemberdata = this.status_member;
      const status = this.memberForm.valid ? 'valid' : 'invalid';

      const finalData = {
        stepThree: stepThreeData,
        family: familyData,
        ordination: ordinationData,
        statusMember: statusMemberdata,
        status,
      };

      this.memberForm.patchValue(finalData);
    } else {
      this.toast.openError('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  handleCreate() {
    this.showLoading();
    const memberData = this.combineStepData();
    this.membersService.createMember(memberData).subscribe({
      next: () => this.onSuccessCreate(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  handleUpdate(memberId: string) {
    this.showLoading();

    const memberData = this.combineStepData();

    this.membersService.getMemberById(memberId).subscribe({
      next: (currentMember) => {
        const changes = this.detectChanges(currentMember, memberData);

        if (changes.length > 0) {
          const historyPromises = changes.map((change) => {
            const historyData: Partial<History> = {
              member_id: memberId,
              table_name: 'members',
              before_situation: change.oldValue || 'N/A',
              after_situation: change.newValue || 'N/A',
              change_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            };

            return this.historyService.saveHistory(historyData);
          });

          Promise.all(historyPromises)
            .then(() => {
              this.membersService
                .updateMember(memberId!, memberData)
                .subscribe({
                  next: () => this.onSuccessUpdate(MESSAGES.UPDATE_SUCCESS),
                  error: () => this.onError(MESSAGES.UPDATE_ERROR),
                  complete: () => this.hideLoading(),
                });
            })
            .catch((error) =>
              this.notification.onError(
                `Erro ao salvar no histórico: ${error}`,
              ),
            );
        } else {
          this.membersService.updateMember(memberId!, memberData).subscribe({
            next: () => this.onSuccessUpdate(MESSAGES.UPDATE_SUCCESS),
            error: () => this.onError(MESSAGES.UPDATE_ERROR),
            complete: () => this.hideLoading(),
          });
        }
      },
      error: () => {
        this.onError(MESSAGES.UPDATE_ERROR);
        this.hideLoading();
      },
    });
  }

  detectChanges(beforeData: any, afterData: any) {
    const changes = [];

    for (const key in afterData) {
      if (afterData[key] !== beforeData[key]) {
        // Comparação mais robusta para evitar falsos positivos
        if (
          (afterData[key] != null || beforeData[key] != null) && // Considerar null e undefined
          JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key]) // Considerar objetos ou arrays
        ) {
          changes.push({
            field: key,
            oldValue: beforeData[key] ?? 'N/A',
            newValue: afterData[key] ?? 'N/A',
          });
        }
      }
    }

    return changes;
  }

  handleEdit = () => {
    if (this.data?.members) {
      this.isEditMode = true;

      const baptismDate = this.data.members.baptism_date
        ? dayjs(this.data.members.baptism_date).toDate()
        : null;

      const baptismHolySpiritDate = this.data.members.baptism_holy_spirit_date
        ? dayjs(this.data.members.baptism_holy_spirit_date).toDate()
        : null;

      const receiptDate = this.data.members.receipt_date
        ? dayjs(this.data.members.receipt_date).toDate()
        : null;

      this.memberForm.patchValue({
        stepThree: {
          baptism_date: baptismDate,
          baptism_holy_spirit_date: baptismHolySpiritDate,
          receipt_date: receiptDate,
        },
      });

      this.setValuesAutoComplete();
    }
  };

  setValuesAutoComplete() {
    if (this.data?.members?.person) {
      this.searchControlPerson.setValue(this.data.members.person.name);
      this.memberForm
        .get('stepOne.person_id')
        ?.setValue(this.data.members.person.id);
    }

    if (this.data?.members?.church) {
      this.searchControlChurch.setValue(this.data.members.church.name);
      this.memberForm
        .get('stepOne.church_id')
        ?.setValue(this.data.members.church.id);
    }

    if (this.data?.members?.civil_status) {
      this.searchControlCivilStatus.setValue(
        this.data.members.civil_status.name,
      );
      this.memberForm
        .get('stepOne.civil_status_id')
        ?.setValue(this.data.members.civil_status.id);
    }

    if (this.data?.members.formation) {
      this.searchControlFormations.setValue(this.data.members.formation.name);
      this.memberForm
        .get('stepTwo.formation_id')
        ?.setValue(this.data.members.formation.id);
    }

    if (this.data?.members?.color_race) {
      this.searchControlColorRace.setValue(this.data.members.color_race.name);
      this.memberForm
        .get('stepOne.color_race_id')
        ?.setValue(this.data.members.color_race.id);
    }

    if (this.data?.members.member_origin) {
      this.searchControlMemberOrigins.setValue(
        this.data.members.member_origin.name,
      );
      this.memberForm
        .get('stepThree.member_origin_id')
        ?.setValue(this.data.members.member_origin.id);
    }
  }

  onSuccessCreate(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.handleEdit();
    this.currentStep = 3;
  }

  onSuccessUpdate(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
  }

  handleUpdateWithoutClosing() {
    this.hideLoading();
    this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
  }

  onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  openAddPersonDialog() {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionar pessoa',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.membersService.getPersons().subscribe((persons) => {
          this.persons = persons;
        });
      }
    });
  }

  openAddChurchDialog() {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Adicionar igreja',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.membersService.getChurch().subscribe((churchs) => {
          this.churchs = churchs;
        });
      }
    });
  }

  openCalendarBaptismDate(): void {
    if (this.baptismPicker) {
      this.baptismPicker.open();
    }
  }

  openCalendarBaptismHolySpiritDate(): void {
    if (this.baptismHolySpiritPicker) {
      this.baptismHolySpiritPicker.open();
    }
  }

  openCalendarReceiptDate(): void {
    if (this.receiptDatePicker) {
      this.receiptDatePicker.open();
    }
  }

  onFormationChange(selectedFormationId: string, formations: Formations[]) {
    const selectedFormation = formations.find(
      (f) => f.id === selectedFormationId,
    );
    const formationCourseControl = this.memberForm.get(
      'stepTwo.formation_course',
    );

    if (
      selectedFormation &&
      this.formationsRequiringCourse.includes(selectedFormation.codigo)
    ) {
      this.isFormationCourseVisible = true;
      formationCourseControl?.setValidators(Validators.required);
    } else {
      this.isFormationCourseVisible = false;
      formationCourseControl?.clearValidators();
    }

    formationCourseControl?.updateValueAndValidity();
  }
}
