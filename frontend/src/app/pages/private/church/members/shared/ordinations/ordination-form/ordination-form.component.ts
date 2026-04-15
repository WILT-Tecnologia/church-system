import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { MAT_DATE_LOCALE, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from '@app/components/actions/actions.component';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Occupation } from '@app/model/Occupation';
import { Ordination } from '@app/model/Ordination';
import { OccupationComponent } from '@app/pages/private/administrative/occupations/occupation/occupation.component';
import { OccupationsService } from '@app/pages/private/administrative/occupations/occupations.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { provideNgxMask } from 'ngx-mask';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { OrdinationsService } from '../ordinations.service';

@Component({
  selector: 'app-ordination-form',
  templateUrl: './ordination-form.component.html',
  styleUrls: ['./ordination-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly ordinationsService = inject(OrdinationsService);
  private readonly occupationService = inject(OccupationsService);
  private readonly loading = inject(LoadingService);
  private readonly validationService = inject(ValidationService);
  private readonly modalService = inject(ModalService);
  private readonly dialogRef = inject(MatDialogRef<OrdinationFormComponent>);
  public readonly data = inject<{ ordination: Ordination }>(MAT_DIALOG_DATA);

  public readonly ordinationForm: FormGroup;
  public readonly occupations = signal<Occupation[]>([]);
  public readonly isEditMode = signal(false);

  public readonly searchControlOccupation = new FormControl('');
  public filterOccupations!: Observable<Occupation[]>;

  constructor() {
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
      occupation_id: [this.data?.ordination?.occupation?.id ?? '', Validators.required],
      initial_date: [this.data?.ordination?.initial_date ?? '', Validators.required],
      end_date: [this.data?.ordination?.end_date ?? '', Validators.required],
      status: [this.data?.ordination?.status ?? true, Validators.required],
    });
  };

  private loadInitialData() {
    forkJoin({
      occupations: this.occupationService.getOccupations(),
    }).subscribe({
      next: ({ occupations }) => {
        this.occupations.set(occupations);
      },
      error: (error) => {
        this.onError(error ? error.error?.message || error.message : MESSAGES.LOADING_ERROR);
      },
    });
  }

  showAllOccupations() {
    this.filterOccupations = this.searchControlOccupation.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name: string) =>
        name.length >= 1 ? this._filterOccupations(name) : this.occupations(),
      ),
    );
  }

  private _filterOccupations(name: string): Occupation[] {
    const filterValue = name.toLowerCase();
    return this.occupations().filter((occ) => occ.name.toLowerCase().includes(filterValue));
  }

  onSelectedOccupation(event: MatAutocompleteSelectedEvent) {
    const occupation = event.option.value;

    this.searchControlOccupation.setValue(occupation.name);
    this.ordinationForm.get('occupation_id')?.setValue(occupation.id);
  }

  private checkEditMode() {
    if (this.data?.ordination?.id) {
      this.isEditMode.set(true);
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
    this.dialogRef.close(this.ordinationForm.getRawValue());
  }

  onError(message: string): void {
    this.loading.hide();
    this.toast.openError(message);
  }

  onCancel() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const ordination = this.ordinationForm.getRawValue();

    if (this.ordinationForm.invalid) {
      this.ordinationForm.markAllAsTouched();
      this.searchControlOccupation.markAsTouched();
      return;
    }

    if (!ordination) return;

    if (this.isEditMode()) {
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
      this.searchControlOccupation.setValue(this.data?.ordination?.occupation?.name);
      this.ordinationForm.get('occupation_id')?.setValue(this.data?.ordination?.occupation?.id);
    }

    this.ordinationForm.patchValue({
      member_id: this.data?.ordination?.member?.id,
    });
  };

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
