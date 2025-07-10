import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { forkJoin, map, Observable, startWith, Subject } from 'rxjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberSituations } from 'app/model/Auxiliaries';
import { StatusMember } from 'app/model/Members';
import { ValidationService } from 'app/services/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';

import { StatusMemberService } from '../status-member.service';

@Component({
  selector: 'app-status-member-form',
  templateUrl: './status-member-form.component.html',
  styleUrl: './status-member-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
    MatTooltip,
  ],
  providers: [provideNgxMask(), provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
})
export class StatusMemberFormComponent implements OnInit, OnDestroy {
  statusMemberForm: FormGroup;
  membersSituations: MemberSituations[] = [];
  isEditMode: boolean = false;

  searchMemberSituationControl = new FormControl();

  filterMemberSituation: Observable<MemberSituations[]> = new Observable<MemberSituations[]>();

  readonly minDate = new Date(1900, 0, 1);
  readonly maxDate = new Date(new Date().getFullYear() + 1, 12, 31);
  private destroy$ = new Subject<void>();
  @ViewChild('initial_period') initial_period!: MatDatepicker<Date>;
  @ViewChild('final_period') final_period!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private loading: LoadingService,
    private statusMemberService: StatusMemberService,
    private validationService: ValidationService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<StatusMemberFormComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { status_member: StatusMember },
  ) {
    this.statusMemberForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode() {
    if (this.data?.status_member?.id) {
      this.isEditMode = true;
      this.handleEdit();
    }
  }

  createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data?.status_member?.id ?? ''],
      member_id: [this.data?.status_member?.member ?? '', [Validators.required]],
      member_situation_id: [this.data?.status_member?.member_situation?.id ?? '', [Validators.required]],
      initial_period: [this.data?.status_member?.initial_period ?? '', [Validators.required]],
      final_period: [this.data?.status_member?.final_period ?? '', [Validators.required]],
    });
  };

  showLoading() {
    this.loading.show();
  }

  hideLoading() {
    this.loading.hide();
  }

  onSuccess(message: string) {
    this.hideLoading();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.statusMemberForm.value);
    this.loadInitialData();
  }

  onError(message: string) {
    this.hideLoading();
    this.toast.openError(message);
  }

  onCancel() {
    this.dialogRef.close();
  }

  loadInitialData() {
    this.showLoading();
    forkJoin({
      membersSituations: this.statusMemberService.getMemberSituations(),
    }).subscribe({
      next: ({ membersSituations }) => {
        this.membersSituations = membersSituations;
      },
      error: () => this.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  showAllMembersSituations() {
    this.filterMemberSituation = this.searchMemberSituationControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) => (name.length >= 1 ? this._filterMembersSituations(name) : this.membersSituations)),
    );
  }

  private _filterMembersSituations(name: string): MemberSituations[] {
    const filterValue = name.toLowerCase();
    return this.membersSituations.filter((membersSituations) =>
      membersSituations.name.toLowerCase().includes(filterValue),
    );
  }

  onSelectedMemberSituations(event: MatAutocompleteSelectedEvent) {
    const memberSituations = event.option.value;

    this.searchMemberSituationControl.setValue(memberSituations.name);
    this.statusMemberForm.get('member_situation_id')?.setValue(memberSituations.id);
  }

  handleSubmit() {
    const statusMember = this.statusMemberForm;

    if (statusMember.invalid) return;

    if (this.isEditMode) {
      this.handleUpdate(statusMember.value.id, statusMember.value);
    } else {
      this.handleCreate(statusMember.value);
    }
  }

  handleCreate(data: any) {
    this.showLoading();
    this.statusMemberService.create(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  handleUpdate(id: string, data: any) {
    this.showLoading();
    this.statusMemberService.update(id, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  handleEdit = () => {
    const statusMember = this.data.status_member;

    if (!statusMember.id) return;

    if (statusMember?.member_situation?.id) {
      this.searchMemberSituationControl.setValue(statusMember?.member_situation?.name);
      this.statusMemberForm.get('member_situation_id')?.setValue(statusMember?.member_situation?.id);
    }

    const initialPeriod = this.data.status_member.initial_period ? dayjs(statusMember?.initial_period).toDate() : null;

    const finalPeriod = this.data.status_member.final_period ? dayjs(statusMember?.final_period).toDate() : null;

    this.statusMemberForm.patchValue({
      member_id: statusMember?.member,
      initial_period: initialPeriod,
      final_period: finalPeriod,
    });

    this.cdr.detectChanges();
  };

  clearDate(fieldName: string): void {
    this.statusMemberForm.get(fieldName)?.setValue(null);
  }

  getErrorMessage(controlName: string) {
    const control = this.statusMemberForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  openCalendarInitial_period(): void {
    if (this.initial_period) {
      this.initial_period.open();
    }
  }

  openCalendarFinal_period(): void {
    if (this.final_period) {
      this.final_period.open();
    }
  }
}
