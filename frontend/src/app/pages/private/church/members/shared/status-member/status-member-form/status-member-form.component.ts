import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
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
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { ActionsComponent } from '@app/components/actions/actions.component';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { MemberSituations } from '@app/model/Auxiliaries';
import { StatusMember } from '@app/model/Members';
import { ValidationService } from '@app/services/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith } from 'rxjs';
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
  providers: [
    provideNgxMask(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
})
export class StatusMemberFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly statusMemberService = inject(StatusMemberService);
  private readonly validationService = inject(ValidationService);
  private readonly dialogRef = inject(MatDialogRef<StatusMemberFormComponent>);
  public readonly data = inject<{ status_member: StatusMember }>(MAT_DIALOG_DATA);

  public readonly statusMemberForm: FormGroup;
  public readonly membersSituations = signal<MemberSituations[]>([]);
  public readonly isEditMode = signal(false);
  public readonly searchMemberSituationControl = new FormControl();
  public filterMemberSituation!: Observable<MemberSituations[]>;

  public readonly minDate = new Date(1900, 0, 1);
  public readonly maxDate = new Date(new Date().getFullYear() + 1, 12, 31);

  @ViewChild('initial_period') initial_period!: MatDatepicker<Date>;
  @ViewChild('final_period') final_period!: MatDatepicker<Date>;

  constructor() {
    this.statusMemberForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  private checkEditMode() {
    if (this.data?.status_member?.id) {
      this.isEditMode.set(true);
      this.handleEdit();
    }
  }

  createForm = (): FormGroup => {
    return this.fb.group({
      id: [this.data?.status_member?.id ?? ''],
      member_id: [this.data?.status_member?.member ?? '', [Validators.required]],
      member_situation_id: [
        this.data?.status_member?.member_situation?.id ?? '',
        [Validators.required],
      ],
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
    this.dialogRef.close(this.statusMemberForm.getRawValue());
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
        this.membersSituations.set(membersSituations);
      },
      error: () => this.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.hideLoading(),
    });
  }

  showAllMembersSituations() {
    this.filterMemberSituation = this.searchMemberSituationControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) =>
        name.length >= 1 ? this._filterMembersSituations(name) : this.membersSituations(),
      ),
    );
  }

  private _filterMembersSituations(name: string): MemberSituations[] {
    const filterValue = name.toLowerCase();
    return this.membersSituations().filter((ms) => ms.name.toLowerCase().includes(filterValue));
  }

  onSelectedMemberSituations(event: MatAutocompleteSelectedEvent) {
    const memberSituations = event.option.value;

    this.searchMemberSituationControl.setValue(memberSituations.name);
    this.statusMemberForm.get('member_situation_id')?.setValue(memberSituations.id);
  }

  handleSubmit() {
    const statusMember = this.statusMemberForm;

    if (statusMember.invalid) {
      statusMember.markAllAsTouched();
      this.searchMemberSituationControl.markAsTouched();
      return;
    }

    if (this.isEditMode()) {
      this.handleUpdate(statusMember.getRawValue().id, statusMember.getRawValue());
    } else {
      this.handleCreate(statusMember.getRawValue());
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

  private handleEdit = () => {
    const statusMember = this.data.status_member;

    if (!statusMember.id) return;

    if (statusMember?.member_situation?.id) {
      this.searchMemberSituationControl.setValue(statusMember?.member_situation?.name);
      this.statusMemberForm
        .get('member_situation_id')
        ?.setValue(statusMember?.member_situation?.id);
    }

    const initialPeriod = this.data.status_member.initial_period
      ? dayjs(statusMember?.initial_period).toDate()
      : null;

    const finalPeriod = this.data.status_member.final_period
      ? dayjs(statusMember?.final_period).toDate()
      : null;

    this.statusMemberForm.patchValue({
      member_id: statusMember?.member,
      initial_period: initialPeriod,
      final_period: finalPeriod,
    });
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
