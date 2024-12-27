import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberSituations } from 'app/model/Auxiliaries';
import { Members, StatusMember } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { debounceTime, forkJoin, map, Observable, startWith } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
import { MembersService } from '../../../members.service';
import { StatusMemberService } from '../status-member.service';

@Component({
  selector: 'app-status-member-form',
  standalone: true,
  templateUrl: './status-member-form.component.html',
  styleUrl: './status-member-form.component.scss',
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
})
export class StatusMemberFormComponent implements OnInit {
  statusMemberForm: FormGroup = {} as any;
  isEditMode: boolean = false;

  searchControlMembers = new FormControl();
  searchControlStatusMember = new FormControl();

  filterMembers: Observable<Members[]> = new Observable<Members[]>();
  filterStatusMember: Observable<MemberSituations[]> = new Observable<
    MemberSituations[]
  >();

  members: Members[] = [];
  membersSituations: MemberSituations[] = [];
  statusMember: StatusMember[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private membersService: MembersService,
    private statusMemberService: StatusMemberService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<StatusMemberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { statusMember: StatusMember },
  ) {
    this.statusMemberForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.data?.statusMember?.id ?? ''],
      member_id: [
        this.data?.statusMember?.member?.id ?? '',
        [Validators.required],
      ],
      member_situation_id: [
        this.data?.statusMember?.member_situation?.id ?? '',
        [Validators.required],
      ],
      initial_period: [
        this.data?.statusMember?.initial_period ?? '',
        [Validators.required],
      ],
      final_period: [
        this.data?.statusMember?.final_period ?? '',
        [Validators.required],
      ],
    });
  }

  showLoading() {
    this.loadingService.show();
  }

  hideLoading() {
    this.loadingService.hide();
  }

  onSuccess(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.statusMemberForm.value);
  }

  onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  onCancel() {
    this.dialogRef.close();
  }

  clearDate(fieldName: string): void {
    this.statusMemberForm.get(fieldName)?.setValue(null);
  }

  private setupFilter(
    control: FormControl,
    items: any[],
    field: string,
  ): Observable<any[]> {
    return control.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => {
        return items.filter((item) =>
          this.validationService
            .getFieldValue(item, field)
            ?.toLowerCase()
            .includes(searchTerm?.toLowerCase()),
        );
      }),
    );
  }

  private initializeFilters() {
    this.filterMembers = this.setupFilter(
      this.searchControlMembers,
      this.members,
      'person.name',
    );

    this.filterStatusMember = this.setupFilter(
      this.searchControlStatusMember,
      this.membersSituations,
      'name',
    );
  }

  loadInitialData() {
    this.showLoading();
    forkJoin({
      members: this.membersService.getMembers(),
      membersSituations: this.statusMemberService.getMemberSituations(),
      statusMember: this.statusMemberService.getStatusMembers(),
    }).subscribe({
      next: ({ members, statusMember, membersSituations }) => {
        this.members = members;
        this.statusMember = statusMember;
        this.membersSituations = membersSituations;
        this.initializeFilters();
      },
      error: () => this.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  private checkEditMode() {
    if (this.data && this.data?.statusMember && this.data?.statusMember?.id) {
      this.statusMemberForm.patchValue(this.data.statusMember);
      this.isEditMode = true;
      this.handleEdit();
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.statusMemberForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  private getFormData(): any {
    return {
      id: this.statusMemberForm.value.id ?? '',
      member_id: this.statusMemberForm.value.member_id,
      member_situation_id: this.statusMemberForm.value.member_situation_id,
      initial_period: this.statusMemberForm.value.initial_period,
      final_period: this.statusMemberForm.value.final_period,
    };
  }

  handleSubmit() {
    if (this.statusMemberForm.invalid) return;

    const data = this.getFormData();
    const id = this.statusMemberForm.value.id;

    if (this.isEditMode) {
      data.id = id;
      this.handleUpdate(id, data);
    } else {
      this.handleCreate(data);
    }
  }

  handleCreate(data: any) {
    this.showLoading();
    this.statusMemberService.createStatusMember(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  handleUpdate(id: string, data: any) {
    this.showLoading();
    this.statusMemberService.updateStatusMember(id, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  handleEdit = () => {
    this.statusMemberService
      .getStatusMemberById(this.data?.statusMember?.id)
      .subscribe((statusMember: StatusMember) => {
        this.statusMemberForm.patchValue({
          id: statusMember.id ?? '',
          member_id: statusMember.member ? statusMember.member_id : '',
          member_situation_id: statusMember.member_situation
            ? statusMember.member_situation_id
            : '',
          initial_period: statusMember.initial_period ?? '',
          final_period: statusMember.final_period,
        });
      });
  };

  displayNameMember(): string {
    const memberId = this.statusMemberForm.get('member_id')?.value;
    const selectedMember = this.members.find(
      (member) => member.id === memberId,
    );
    return selectedMember ? selectedMember.person.name : 'Selecione o membro';
  }

  displayNameSituationMember(): string {
    const situationId = this.statusMemberForm.get('member_situation_id')?.value;
    const selectedSituationMember = this.membersSituations.find(
      (situation) => situation.id === situationId,
    );
    return selectedSituationMember
      ? selectedSituationMember?.name
      : 'Selecione a situação';
  }
}
