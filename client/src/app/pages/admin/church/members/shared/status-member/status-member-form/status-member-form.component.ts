import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
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
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { MemberSituations } from 'app/model/Auxiliaries';
import { StatusMember } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
import { StatusMemberService } from '../status-member.service';

@Component({
  selector: 'app-status-member-form',
  standalone: true,
  templateUrl: './status-member-form.component.html',
  styleUrl: './status-member-form.component.scss',
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
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
})
export class StatusMemberFormComponent implements OnInit {
  statusMemberForm: FormGroup;
  membersSituations: MemberSituations[] = [];
  isEditMode: boolean = false;

  searchMemberSituationControl = new FormControl();

  filterMemberSituation: Observable<MemberSituations[]> = new Observable<
    MemberSituations[]
  >();

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private loading: LoadingService,
    private statusMemberService: StatusMemberService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<StatusMemberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { statusMember: StatusMember },
  ) {
    this.statusMemberForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  private checkEditMode() {
    if (this.data?.statusMember?.id) {
      this.isEditMode = true;
      this.handleEdit();
    }
  }

  createForm = (): FormGroup => {
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
    this.filterMemberSituation =
      this.searchMemberSituationControl.valueChanges.pipe(
        startWith(''),
        map((value: any) => {
          if (typeof value === 'string') {
            return value;
          } else {
            return value ? value.name : '';
          }
        }),
        map((name) =>
          name.length >= 1
            ? this._filterMembersSituations(name)
            : this.membersSituations,
        ),
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
    this.statusMemberForm
      .get('member_situation_id')
      ?.setValue(memberSituations.id);
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
    const statusMember = this.data.statusMember;

    if (!statusMember.id) return;

    if (statusMember?.member_situation?.id) {
      this.searchMemberSituationControl.setValue(
        statusMember?.member_situation?.name,
      );
      this.statusMemberForm
        .get('member_situation_id')
        ?.setValue(statusMember?.member_situation?.id);
    }

    this.statusMemberForm.patchValue({
      member_id: statusMember?.member?.id,
    });
  };

  clearDate(fieldName: string): void {
    this.statusMemberForm.get(fieldName)?.setValue(null);
  }

  getErrorMessage(controlName: string) {
    const control = this.statusMemberForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }
}
