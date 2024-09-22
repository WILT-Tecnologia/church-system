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
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { Members } from 'app/model/Members';
import { Occupation } from 'app/model/Occupation';
import { Ordination } from 'app/model/Ordination';
import { OccupationComponent } from 'app/pages/admin/administrative/occupations/occupation/occupation.component';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { MemberFormComponent } from '../../members/member/member-form/member-form.component';
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
    MatCardModule,
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
  ordinationForm: FormGroup;
  ordinationId: string | null = null;
  isEditMode: boolean = false;
  member: Members[] = [];
  occupation: Occupation[] = [];
  searchControl = new FormControl();
  filterMembers: Observable<Members[]>;
  filterOccupations: Observable<Occupation[]>;

  constructor(
    private ordinationsService: OrdinationsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OrdinationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ordination: Ordination },
  ) {
    this.ordinationForm = this.createOrdinationForm();
    this.filterMembers = this.setupSearchObservable('Members');
    this.filterOccupations = this.setupSearchObservable('Occupation');
  }

  ngOnInit() {
    if (this.data && this.data.ordination) {
      this.isEditMode = true;
      this.ordinationId = this.data.ordination.id;
      this.ordinationForm.patchValue(this.data.ordination);
      this.handleEditMode();
    }
  }

  get pageTitle() {
    return this.isEditMode ? 'Editar ordenação' : 'Criar ordenação';
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

  createOrdinationForm() {
    return this.fb.group({
      id: [this.data?.ordination?.id || ''],
      member_id: [this.data?.ordination?.member_id || '', Validators.required],
      occupation_id: [
        this.data?.ordination?.occupation_id || '',
        Validators.required,
      ],
      status: [this.data?.ordination?.status || true, Validators.required],
      initial_date: [
        this.data?.ordination?.initial_date || '',
        Validators.required,
      ],
      end_date: [this.data?.ordination?.end_date || '', Validators.required],
    });
  }

  updateOrdination(ordinationId: string) {
    this.loadingService.show();
    this.ordinationsService
      .updateOrdination(ordinationId, this.ordinationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ordenação atualizada!');
          this.dialogRef.close(this.ordinationForm.value);
        },
        error: () => {
          this.snackbarService.openError(
            'Erro ao atualizar a ordenação. Tente novamente!',
          );
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  handleEditMode = () => {
    this.ordinationsService
      .getOrdinationById(this.ordinationId!)
      .subscribe((ordination: Ordination) => {
        this.ordinationForm.patchValue({
          ...ordination,
          updated_at: dayjs(ordination.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
      });
  };

  onSubmit() {
    this.loadingService.show();
    this.ordinationsService
      .createOrdination(this.ordinationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ordenação criada com sucesso!');
          this.dialogRef.close(this.ordinationForm.value);
        },
        error: () => {
          this.snackbarService.openError(
            'Erro ao criar a ordenação. Tente novamente!',
          );
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  onCancel() {
    this.dialogRef.close();
  }

  clearDate(fieldName: string): void {
    this.ordinationForm.get(fieldName)?.setValue(null);
  }

  setupSearchObservable(type: string): Observable<any[]> {
    return this.searchControl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) =>
        (this as any)
          [`filter${type}`](searchTerm ?? '')
          .sort((a: any, b: any) => a.name.localeCompare(b.name)),
      ),
    );
  }

  loadInitialData() {
    this.fetchData(this.ordinationsService.getMembers(), 'members');
    this.fetchData(this.ordinationsService.getOccupations(), 'occupations');
  }

  fetchData(fetchObservable: Observable<any[]>, target: string) {
    fetchObservable.subscribe((data) => {
      (this as any)[target] = data;
      (this as any)[
        `filtered${target.charAt(0).toUpperCase() + target.slice(1)}$`
      ] = this.setupSearchObservable(target.slice(0, -1));
    });
  }

  filterMember(value: string): Members[] {
    return this.member.filter((member) =>
      member.person_id.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterOccupation(value: string): Occupation[] {
    return this.occupation.filter((occupation) =>
      occupation.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  getMemberName(): string {
    const memberId = this.ordinationForm.get('member_id')?.value;
    if (memberId) {
      const member = this.member.find((r) => r.id === memberId);
      return member?.person_id.name ?? '';
    }
    return memberId ? 'Selecione o membro' : 'Selecione o membro';
  }

  getOccupationName(): string {
    const occupationId = this.ordinationForm.get('occupation_id')?.value;
    if (occupationId) {
      const occupation = this.occupation.find((r) => r.id === occupationId);
      return occupation?.name ?? '';
    }
    return occupationId ? 'Selecione o membro' : 'Selecione o membro';
  }

  onSelectOpenedChangeMember(isOpen: boolean) {
    if (isOpen) {
      this.ordinationsService.getMembers().subscribe((member) => {
        this.member = member;
        this.filterMembers = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          startWith(''),
          map((searchTerm) =>
            this.filterMember(searchTerm ?? '').sort((a, b) =>
              a.person_id.name.localeCompare(b.person_id.name),
            ),
          ),
        );
      });
    }
  }

  onSelectOpenedChangeOccupation(isOpen: boolean) {
    if (isOpen) {
      this.ordinationsService.getOccupations().subscribe((Occupation) => {
        this.occupation = Occupation;
        this.filterOccupations = this.searchControl.valueChanges.pipe(
          debounceTime(300),
          startWith(''),
          map((searchTerm) =>
            this.filterOccupation(searchTerm ?? '').sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
          ),
        );
      });
    }
  }

  openAddMemberForm() {
    this.dialog.open(MemberFormComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: ['dialog'],
      disableClose: true,
    });
  }

  openAddOccupationForm() {
    this.dialog.open(OccupationComponent, {
      width: '50dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
  }
}
