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
import { provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../../../components/column/column.component';
import { LoadingService } from '../../../../../../../components/loading/loading.service';
import { ModalService } from '../../../../../../../components/modal/modal.service';
import { MESSAGES } from '../../../../../../../components/toast/messages';
import { ToastService } from '../../../../../../../components/toast/toast.service';
import { Members } from '../../../../../../../model/Members';
import { Occupation } from '../../../../../../../model/Occupation';
import { Ordination } from '../../../../../../../model/Ordination';
import { ValidationService } from '../../../../../../../services/validation/validation.service';
import { OccupationComponent } from '../../../../../administrative/occupations/occupation/occupation.component';
import { OccupationsService } from '../../../../../administrative/occupations/occupations.service';
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
    MatAutocompleteModule,
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
})
export class OrdinationFormComponent implements OnInit {
  ordinationForm: FormGroup;
  occupation: Occupation[] = [];
  isEditMode: boolean = false;

  searchControlMembers = new FormControl('');
  searchControlOccupation = new FormControl('');

  filterMembers: Observable<Members[]> = new Observable<Members[]>();
  filterOccupations: Observable<Occupation[]> = new Observable<Occupation[]>();

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private ordinationsService: OrdinationsService,
    private occupationService: OccupationsService,
    private loading: LoadingService,
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

  createForm = (): FormGroup => {
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
  };

  private loadInitialData() {
    forkJoin({
      occupations: this.occupationService.getOccupations(),
    }).subscribe({
      next: ({ occupations }) => {
        this.occupation = occupations;
      },
      error: (error) => {
        this.onError(error ? error.error.message : MESSAGES.LOADING_ERROR);
      },
      complete: () => {},
    });
  }

  showAllOccupations() {
    this.filterOccupations = this.searchControlOccupation.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name: string) =>
        name.length >= 1 ? this._filterOccupations(name) : this.occupation,
      ),
    );
  }

  private _filterOccupations(name: string): Occupation[] {
    const filterValue = name.toLowerCase();
    return this.occupation.filter((occupation) =>
      occupation.name.toLowerCase().includes(filterValue),
    );
  }

  onSelectedOccupation(event: MatAutocompleteSelectedEvent) {
    const occupation = event.option.value;

    this.searchControlOccupation.setValue(occupation.name);
    this.ordinationForm.get('occupation_id')?.setValue(occupation.id);
  }

  private checkEditMode() {
    if (this.data?.ordination?.id) {
      this.isEditMode = true;
      this.handleEdit();
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.ordinationForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  onSuccess(message: string): void {
    this.loading.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.ordinationForm.value);
  }

  onError(message: string): void {
    this.loading.hide();
    this.toast.openError(message);
  }

  onCancel() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const ordination = this.ordinationForm.value;

    if (!ordination) return;

    if (this.isEditMode) {
      this.handleUpdate(ordination.id, ordination);
    } else {
      this.handleCreate(ordination);
    }
  }

  handleCreate(data: any) {
    this.loading.show();
    this.ordinationsService.createOrdination(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  handleUpdate(ordinationId: string, data?: any) {
    this.loading.show();
    this.ordinationsService.updateOrdination(ordinationId, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private handleEdit = () => {
    if (!this.data?.ordination) return;

    if (this.data?.ordination?.occupation) {
      this.searchControlOccupation.setValue(
        this.data?.ordination?.occupation?.name,
      );
      this.ordinationForm
        .get('occupation_id')
        ?.setValue(this.data?.ordination?.occupation?.id);
    }

    this.ordinationForm.patchValue({
      member_id: this.data?.ordination?.member?.id,
    });
  };

  clearDate(fieldName: string): void {
    this.ordinationForm.get(fieldName)?.setValue(null);
  }

  openAddOccupationForm() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      'Adicionando ocupação',
      true,
      true,
    );
  }
}
