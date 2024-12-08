import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
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
import { ModalService } from 'app/components/modal/modal.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Members } from 'app/model/Members';
import { Occupation } from 'app/model/Occupation';
import { Ordination } from 'app/model/Ordination';
import { OccupationComponent } from 'app/pages/admin/administrative/occupations/occupation/occupation.component';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { debounceTime, forkJoin, map, Observable, startWith } from 'rxjs';
import { MemberComponent } from '../../../member/member.component';
import { OrdinationsService } from '../ordinations.service';

@Component({
  selector: 'app-ordination-form',
  templateUrl: './ordination-form.component.html',
  styleUrls: ['./ordination-form.component.scss'],
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
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
  ],
})
export class OrdinationFormComponent implements OnInit {
  ordinationId: string | null = null;
  ordinationForm: FormGroup = {} as any;
  isEditMode: boolean = false;
  searchControl = new FormControl();
  searchControlMembers = new FormControl();
  searchControlOccupation = new FormControl();

  filterMembers: Observable<Members[]> = new Observable<Members[]>();
  filterOccupations: Observable<Occupation[]> = new Observable<Occupation[]>();

  members: Members[] = [];
  occupations: Occupation[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private ordinationsService: OrdinationsService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private modalService: ModalService,
    private dialogRef: MatDialogRef<OrdinationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ordination: Ordination },
  ) {
    this.ordinationForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.data?.ordination?.id ?? ''],
      member_id: [this.data?.ordination?.member?.id ?? '', Validators.required],
      occupation_id: [
        this.data?.ordination?.occupation?.id ?? '',
        Validators.required,
      ],
      initial_date: [
        this.data?.ordination?.initial_date ?? '',
        Validators.required,
      ],
      end_date: [this.data?.ordination?.end_date ?? '', Validators.required],
      status: [this.data?.ordination?.status ?? true, Validators.required],
    });
  }

  private getFieldValue(item: any, field: string): string | undefined {
    return field.split('.').reduce((acc, part) => acc?.[part], item);
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
          this.getFieldValue(item, field)
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

    this.filterOccupations = this.setupFilter(
      this.searchControlOccupation,
      this.occupations,
      'name',
    );
  }

  loadInitialData() {
    this.loadingService.show();
    forkJoin({
      members: this.ordinationsService.getMembers(),
      occupations: this.ordinationsService.getOccupations(),
    }).subscribe({
      next: ({ members, occupations }) => {
        this.members = members;
        this.occupations = occupations;
        this.initializeFilters();
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  private checkEditMode() {
    if (this.data && this.data?.ordination && this.data?.ordination?.id) {
      this.ordinationId = this.data.ordination.id;
      this.isEditMode = true;
      this.handleEdit();
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.ordinationForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    const birthDate = control.value;
    if (!birthDate) return null;
    return dayjs(birthDate).isBefore(dayjs()) ? null : { invalidDate: true };
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.ordinationForm.value);
  }

  onError(message: string) {
    this.loadingService.hide();
    this.toast.openError(message);
  }

  private getFormData(): any {
    return {
      id: this.ordinationId ?? '',
      member_id: this.ordinationForm.value.member_id,
      occupation_id: this.ordinationForm.value.occupation_id,
      initial_date: this.ordinationForm.value.initial_date,
      end_date: this.ordinationForm.value.end_date,
      status: this.ordinationForm.value.status,
    };
  }

  handleSubmit() {
    if (this.ordinationForm.invalid) return;

    const data = this.getFormData();

    if (this.isEditMode) {
      data.id = this.ordinationId;
    }

    this.isEditMode
      ? this.handleUpdate(this.ordinationId!, data)
      : this.handleCreate(data);
  }

  handleCreate(data: any) {
    this.loadingService.show();
    this.ordinationsService.createOrdination(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  handleUpdate(ordinationId: string, data: any) {
    this.loadingService.show();
    this.ordinationsService.updateOrdination(ordinationId, data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  handleEdit = () => {
    this.ordinationsService
      .getOrdinationById(this.ordinationId!)
      .subscribe((ordination: Ordination) => {
        this.ordinationForm.patchValue({
          id: ordination.id ?? '',
          member_id: ordination.member_id ?? '',
          occupation_id: ordination.occupation_id ?? '',
          initial_date: ordination.initial_date ?? '',
          end_date: ordination.end_date ?? '',
          status: ordination.status ?? true,
        });
      });
  };

  onCancel() {
    this.dialogRef.close();
  }

  clearDate(fieldName: string): void {
    this.ordinationForm.get(fieldName)?.setValue(null);
  }

  displayNameMember(): string {
    const memberId = this.ordinationForm.get('member_id')?.value;
    const selectedMember = this.members.find(
      (member) => member.id === memberId,
    );
    return selectedMember ? selectedMember.person.name : '';
  }

  displayNameOccupation(): string {
    const occupationId = this.ordinationForm.get('occupation_id')?.value;
    const occupation = this.occupations.find(
      (occupation) => occupation.id === occupationId,
    );
    return occupation ? occupation?.name : '';
  }

  openAddMemberForm() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Adicionar membro',
      true,
      [],
      true,
    );
  }

  openAddOccupationForm() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      'Adicionar ocupação',
      true,
      [],
      true,
    );
  }
}
