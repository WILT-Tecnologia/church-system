import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
  ],
})
export class OrdinationFormComponent implements OnInit {
  ordinationForm: FormGroup;
  isEditMode: boolean = false;
  ordinationId: string | null = null;
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
    private dialog: MatDialog
  ) {
    this.ordinationForm = this.createOrdinationForm();

    this.filterMembers = this.setupSearchObservable('Members');

    this.filterOccupations = this.setupSearchObservable('Occupation');
  }

  ngOnInit() {
    this.loadingService.show();
    this.ordinationId = this.route.snapshot.paramMap.get('id');
    if (this.ordinationId) {
      this.isEditMode = true;
      this.handleEditMode();
    }
    this.loadInitialData();

    this.loadingService.hide();
  }

  createOrdinationForm() {
    return this.fb.group({
      member_id: ['', Validators.required],
      occupation_id: ['', Validators.required],
      status: ['', Validators.required],
      initial_date: ['', Validators.required],
      end_date: ['', Validators.required],
    });
  }

  handleEditMode = () => {
    this.ordinationsService
      .getOrdinationById(this.ordinationId!)
      .subscribe((ordination: Ordination) => {
        this.ordinationForm.patchValue({
          ...ordination,
          updated_at: dayjs(ordination.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss'
          ),
        });
      });
  };

  onSubmit() {
    this.loadingService.show();
    if (this.ordinationForm.valid) {
      console.log(this.ordinationForm.value);
      this.dialog.closeAll();
    }

    this.loadingService.hide();
  }

  onCancel() {
    this.dialog.closeAll();
  }

  clearDate(fieldName: string): void {
    this.ordinationForm.get(fieldName)?.setValue(null);
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
      member.person_id.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  filterOccupation(value: string): Occupation[] {
    return this.occupation.filter((occupation) =>
      occupation.name.toLowerCase().includes(value.toLowerCase())
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
              a.person_id.name.localeCompare(b.person_id.name)
            )
          )
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
              a.name.localeCompare(b.name)
            )
          )
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
      panelClass: 'dialog',
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
