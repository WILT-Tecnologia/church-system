import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin, Subject } from 'rxjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { CivilStatus, ColorRace, Formations } from 'app/model/Auxiliaries';
import { Church } from 'app/model/Church';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { History, Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { NavigationService } from 'app/services/navigation/navigation.service';
import { NotificationService } from 'app/services/notification/notification.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';

import { MembersService } from '../../members.service';
import { HistoryService } from '../history/history.service';
import { AdditionalInformationComponent } from './shared/additional-information/additional-information.component';
import { IdentificationComponent } from './shared/identification/identification.component';
import { SpiritualInformationComponent } from './shared/spiritual-information/spiritual-information.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(), provideNgxMask(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    ActionsComponent,
    IdentificationComponent,
    AdditionalInformationComponent,
    SpiritualInformationComponent,
  ],
})
export class MemberComponent implements OnInit, OnDestroy {
  memberForm: FormGroup;
  isEditMode: boolean = false;
  isInitialStepCompleted = signal(false);
  enableDefinitionForm = signal(false);
  currentStep = 0;
  memberId: string | null = null;

  members: Members[] = [];
  persons: Person[] = [];
  churchs: Church[] = [];
  civilStatus: CivilStatus[] = [];
  colorRace: ColorRace[] = [];
  formations: Formations[] = [];
  memberOrigins: MemberOrigin[] = [];
  history: History[] = [];

  searchControlPerson = new FormControl('');
  searchControlChurch = new FormControl('');
  searchControlCivilStatus = new FormControl('');
  searchControlColorRace = new FormControl('');
  searchControlFormations = new FormControl('');
  searchControlMemberOrigins = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private historyService: HistoryService,
    private membersService: MembersService,
    private notification: NotificationService,
    private loading: LoadingService,
    public navigationService: NavigationService,
    private dialogRef: MatDialogRef<MemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { members: Members },
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

  getStepFormGroup(step: string): FormGroup {
    const control = this.memberForm.get(step);
    if (control instanceof FormGroup) {
      return control;
    }
    throw new Error(`Control ${step} is not a FormGroup`);
  }

  isTabDisabled(tabIndex: number): boolean {
    if (this.isInitialStepCompleted() && tabIndex >= 3) {
      return false;
    }

    if (this.isEditMode) {
      return false;
    }

    return this.currentStep !== tabIndex;
  }

  onBackStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onNext() {
    const stepForm = this.getCurrentStepFormGroup(this.currentStep);

    if (stepForm && stepForm.valid) {
      this.currentStep++;
    } else {
      stepForm.markAllAsTouched();
      this.toast.openError('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  canProceedToNextStep(): boolean {
    const currentStepGroup = this.getCurrentStepFormGroup();
    return currentStepGroup ? currentStepGroup.valid : false;
  }

  handleBack() {
    this.dialogRef.close(false);
  }

  finalizeStepThree() {
    if (this.memberForm.get('stepThree')?.valid) {
      this.showLoading();
      const memberData = this.combineStepData();

      if (this.isEditMode && this.memberId) {
        this.membersService.updateMember(this.memberId, memberData).subscribe({
          next: () => {
            this.isInitialStepCompleted.set(true);
            this.onSuccessUpdate('Step 3 atualizado com sucesso.', false);
          },
          error: () => this.onError(MESSAGES.UPDATE_ERROR),
          complete: () => this.hideLoading(),
        });
      } else {
        this.membersService.createMember(memberData).subscribe(
          (newMember) => {
            this.memberId = newMember.id;
            this.onSuccessUpdate('Membro criado com sucesso.', false);
            this.hideLoading();
          },
          () => {
            this.onError(MESSAGES.CREATE_ERROR);
            this.hideLoading();
          },
        );
      }
    } else {
      this.toast.openError('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  handleCreate() {
    this.showLoading();
    const memberData = this.combineStepData();
    this.membersService.createMember(memberData).subscribe({
      next: () => {
        this.onSuccessUpdate(MESSAGES.CREATE_SUCCESS);
      },
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
              this.membersService.updateMember(memberId, memberData).subscribe({
                next: () => this.onSuccessUpdate(MESSAGES.UPDATE_SUCCESS, true),
                error: () => this.onError(MESSAGES.UPDATE_ERROR),
                complete: () => this.hideLoading(),
              });
            })
            .catch((error) => {
              this.notification.onError(`Erro ao salvar no histórico: ${error}`);
              this.hideLoading();
            });
        } else {
          this.membersService.updateMember(memberId, memberData).subscribe({
            next: () => this.onSuccessUpdate(MESSAGES.UPDATE_SUCCESS, true),
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

  private createMemberForm = (): FormGroup =>
    this.fb.group({
      stepOne: this.fb.group({
        id: [this.data?.members?.id || ''],
        person_id: [this.data?.members?.person?.id || '', [Validators.required]],
        church_id: [this.data?.members?.church?.id || '', [Validators.required]],
        rg: [this.data?.members?.rg || '', [Validators.required, Validators.maxLength(15)]],
        issuing_body: [this.data?.members?.issuing_body || '', [Validators.required, Validators.maxLength(255)]],
        civil_status_id: [this.data?.members?.civil_status?.id || '', [Validators.required]],
        color_race_id: [this.data?.members?.color_race?.id || '', [Validators.required]],
        nationality: [this.data?.members?.nationality || '', [Validators.required]],
        naturalness: [this.data?.members?.naturalness || '', [Validators.required]],
      }),

      stepTwo: this.fb.group({
        formation_id: [this.data?.members?.formation?.id || '', [Validators.required]],
        formation_course: [this.data?.members?.formation_course || '', [Validators.maxLength(255)]],
        profission: [this.data?.members?.profission || '', [Validators.maxLength(255)]],
        has_disability: [false],
        def_physical: [this.data?.members?.def_physical || false],
        def_visual: [this.data?.members?.def_visual || false],
        def_hearing: [this.data?.members?.def_hearing || false],
        def_intellectual: [this.data?.members?.def_intellectual || false],
        def_mental: [this.data?.members?.def_mental || false],
        def_multiple: [this.data?.members?.def_multiple || false],
        def_other: [this.data?.members?.def_other || false],
        def_other_description: [this.data?.members?.def_other_description || '', [Validators.maxLength(255)]],
      }),

      stepThree: this.fb.group({
        baptism_date: [this.data?.members?.baptism_date || ''],
        baptism_locale: [this.data?.members?.baptism_locale || '', [Validators.maxLength(255)]],
        baptism_official: [this.data?.members?.baptism_official || '', [Validators.maxLength(255)]],
        baptism_holy_spirit: [this.data?.members?.baptism_holy_spirit || false],
        baptism_holy_spirit_date: [this.data?.members?.baptism_holy_spirit_date || ''],
        member_origin_id: [this.data?.members?.member_origin?.id || '', [Validators.required]],
        receipt_date: [this.data?.members?.receipt_date || ''],
      }),

      stepFour: this.fb.group({}),
      stepFive: this.fb.group({}),
      stepSix: this.fb.group({}),
    });

  private showLoading = () => {
    this.loading.show();
  };

  private hideLoading = () => {
    this.loading.hide();
  };

  private loadInitialData() {
    this.showLoading();
    forkJoin({
      persons: this.membersService.getPersons(),
      churchs: this.membersService.getChurch(),
      civilStatus: this.membersService.getCivilStatus(),
      colorRace: this.membersService.getColorRace(),
      formations: this.membersService.getFormations(),
      memberOrigins: this.membersService.getMemberOrigins(),
    }).subscribe({
      next: ({ persons, churchs, civilStatus, colorRace, formations, memberOrigins }) => {
        this.persons = persons;
        this.churchs = churchs;
        this.civilStatus = civilStatus;
        this.colorRace = colorRace;
        this.formations = formations;
        this.memberOrigins = memberOrigins;

        if (this.data?.members) {
          this.handleEdit();
        }
      },
      error: () => {
        this.notification.onError(MESSAGES.LOADING_ERROR);
        this.hideLoading();
      },
      complete: () => this.hideLoading(),
    });
  }

  private getCurrentStepFormGroup(stepIndex?: number): FormGroup {
    switch (stepIndex ?? this.currentStep) {
      case 0:
        return this.getStepFormGroup('stepOne');
      case 1:
        return this.getStepFormGroup('stepTwo');
      case 2:
        return this.getStepFormGroup('stepThree');
      default:
        return this.getStepFormGroup('stepOne');
    }
  }

  private combineStepData() {
    const stepOneData = this.memberForm.get('stepOne')?.value;
    const stepTwoData = this.memberForm.get('stepTwo')?.value;
    const stepThreeData = this.memberForm.get('stepThree')?.value;

    const formattedStepThreeData = {
      ...stepThreeData,
      baptism_date: stepThreeData.baptism_date ? dayjs(stepThreeData.baptism_date).format('YYYY-MM-DD') : null,
      baptism_holy_spirit_date: stepThreeData.baptism_holy_spirit_date
        ? dayjs(stepThreeData.baptism_holy_spirit_date).format('YYYY-MM-DD')
        : null,
      receipt_date: stepThreeData.receipt_date ? dayjs(stepThreeData.receipt_date).format('YYYY-MM-DD') : null,
    };

    return {
      ...stepOneData,
      ...stepTwoData,
      ...formattedStepThreeData,
      member_id: this.memberId,
    };
  }

  private detectChanges(beforeData: any, afterData: any) {
    const changes = [];

    for (const key in afterData) {
      if (afterData[key] !== beforeData[key]) {
        if (
          (afterData[key] != null || beforeData[key] != null) &&
          JSON.stringify(afterData[key]) !== JSON.stringify(beforeData[key])
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

  private handleEdit = () => {
    if (this.data?.members) {
      this.isEditMode = true;
      this.isInitialStepCompleted.set(true);
      this.memberId = this.data.members.id;

      this.memberForm.patchValue({
        stepOne: {
          id: this.data.members.id,
          person_id: this.data.members.person?.id || '',
          church_id: this.data.members.church?.id || '',
          rg: this.data.members.rg || '',
          issuing_body: this.data.members.issuing_body || '',
          civil_status_id: this.data.members.civil_status?.id || '',
          color_race_id: this.data.members.color_race?.id || '',
          nationality: this.data.members.nationality || '',
          naturalness: this.data.members.naturalness || '',
        },
        stepTwo: {
          formation_id: this.data.members.formation?.id || '',
          formation_course: this.data.members.formation_course || '',
          profission: this.data.members.profission || '',
          has_disability: this.data.members.has_disability || false,
          def_physical: this.data.members.def_physical || false,
          def_visual: this.data.members.def_visual || false,
          def_hearing: this.data.members.def_hearing || false,
          def_intellectual: this.data.members.def_intellectual || false,
          def_mental: this.data.members.def_mental || false,
          def_multiple: this.data.members.def_multiple || false,
          def_other: this.data.members.def_other || false,
          def_other_description: this.data.members.def_other_description || '',
        },
        stepThree: {
          baptism_date: this.data.members.baptism_date ? dayjs(this.data.members.baptism_date).toDate() : null,
          baptism_locale: this.data.members.baptism_locale || '',
          baptism_official: this.data.members.baptism_official || '',
          baptism_holy_spirit: this.data.members.baptism_holy_spirit || false,
          baptism_holy_spirit_date: this.data.members.baptism_holy_spirit_date
            ? dayjs(this.data.members.baptism_holy_spirit_date).toDate()
            : null,
          member_origin_id: this.data.members.member_origin?.id || '',
          receipt_date: this.data.members.receipt_date ? dayjs(this.data.members.receipt_date).toDate() : null,
        },
      });

      this.history = this.data.members.history_member || [];

      this.updateSearchControls();
    }
  };

  private updateSearchControls() {
    const stepOne = this.memberForm.get('stepOne')?.value;
    const person = this.persons.find((p) => p.id === stepOne.person_id);
    const church = this.churchs.find((c) => c.id === stepOne.church_id);
    const civilStatus = this.civilStatus.find((cs) => cs.id === stepOne.civil_status_id);
    const colorRace = this.colorRace.find((cr) => cr.id === stepOne.color_race_id);

    this.searchControlPerson.setValue(person?.name || '');
    this.searchControlChurch.setValue(church?.name || '');
    this.searchControlCivilStatus.setValue(civilStatus?.name || '');
    this.searchControlColorRace.setValue(colorRace?.name || '');

    const stepTwo = this.memberForm.get('stepTwo')?.value;
    const formation = this.formations.find((f) => f.id === stepTwo.formation_id);
    this.searchControlFormations.setValue(formation?.name || '');

    const stepThree = this.memberForm.get('stepThree')?.value;
    const memberOrigin = this.memberOrigins.find((mo) => mo.id === stepThree.member_origin_id);
    this.searchControlMemberOrigins.setValue(memberOrigin?.name || '');
  }

  private onSuccessUpdate(message: string, closeDialog: boolean = false) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.dialogRef.close(true);
    this.navigationService.setCurrentStep(0);
  }

  private onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }
}
