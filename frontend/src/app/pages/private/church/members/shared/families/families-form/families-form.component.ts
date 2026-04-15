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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Kinships } from '@app/model/Auxiliaries';
import { Families } from '@app/model/Families';
import { Person } from '@app/model/Person';
import { ValidationService } from '@app/services/validation/validation.service';
import { forkJoin, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { FamiliesService } from '../families.service';

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrl: './families-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatCheckboxModule,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
  ],
})
export class FamiliesFormComponent implements OnInit {
  private readonly familiesService = inject(FamiliesService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly validationService = inject(ValidationService);
  private readonly dialogRef = inject(MatDialogRef<FamiliesFormComponent>);
  public readonly data: { families: Families; submitSubject: Subject<void> } =
    inject(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  public readonly familyForm: FormGroup = this.createForm();
  public readonly isEditMode = signal(false);

  public readonly searchControlMembers = new FormControl('');
  public readonly searchControlPersons = new FormControl('');
  public readonly searchControlKinship = new FormControl('', [Validators.required]);

  public readonly persons = signal<Person[]>([]);
  public readonly kinships = signal<Kinships[]>([]);

  public filterPersons!: Observable<Person[]>;
  public filterKinships!: Observable<Kinships[]>;

  constructor() {
    this.searchControlPersons.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (typeof value === 'string' && this.familyForm.get('is_member')?.value) {
        this.familyForm.get('person_id')?.setValue('');
      }
    });

    this.searchControlKinship.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (typeof value === 'string') {
        this.familyForm.get('kinship_id')?.setValue('');
      }
    });
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  private createForm(): FormGroup {
    const families = this.data.families as Families;
    return this.fb.group({
      id: [families?.id ?? ''],
      is_member: [families?.is_member ?? false],
      member_id: [families?.member?.id ?? '', [Validators.required]],
      name: [families?.name ?? ''],
      person_id: [families?.person?.id ?? ''],
      kinship_id: [families?.kinship?.id ?? '', [Validators.required]],
    });
  }

  showAllPersons() {
    this.filterPersons = this.searchControlPersons.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name?.length >= 1 ? this._filterPerson(name) : this.persons())),
    );
  }

  showAllKinships() {
    this.filterKinships = this.searchControlKinship.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name?.length >= 1 ? this._filterKinships(name) : this.kinships())),
    );
  }

  private loadInitialData() {
    forkJoin({
      persons: this.familiesService.getPersons(),
      kinships: this.familiesService.getKinships(),
    }).subscribe({
      next: ({ persons, kinships }) => {
        this.persons.set(persons);
        this.kinships.set(kinships);
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  private _filterPerson(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.persons().filter((person) => person.name.toLowerCase().includes(filterValue));
  }

  private _filterKinships(name: string): Kinships[] {
    const filterValue = name.toLowerCase();
    return this.kinships().filter((kinship) => kinship.name.toLowerCase().includes(filterValue));
  }

  onPersonSelected(event: MatAutocompleteSelectedEvent) {
    const person = event.option.value;
    this.searchControlPersons.setValue(person.name);
    this.familyForm.get('person_id')?.setValue(person.id);
  }

  onKinshipsSelected(event: MatAutocompleteSelectedEvent) {
    const kinship = event.option.value;
    this.searchControlKinship.setValue(kinship.name);
    this.familyForm.get('kinship_id')?.setValue(kinship.id);
  }

  private checkEditMode() {
    if (this.data?.families?.id) {
      this.isEditMode.set(true);
    }

    if (this.data.families.person) {
      this.searchControlPersons.setValue(this.data?.families?.person?.name);
    }

    if (this.data.families.kinship) {
      this.searchControlKinship.setValue(this.data?.families?.kinship?.name);
    }

    this.toggleNameAndPersonFields();
  }

  onCheckboxChange(event: boolean) {
    this.familyForm.get('is_member')?.setValue(event);
    this.toggleNameAndPersonFields();
  }

  private toggleNameAndPersonFields() {
    const nameControl = this.familyForm.get('name');
    const personControl = this.familyForm.get('person_id');
    const isMember = this.familyForm.get('is_member')?.value;

    if (isMember) {
      nameControl?.clearValidators();
      nameControl?.disable();
      nameControl?.setValue('');

      personControl?.setValidators([Validators.required]);
      personControl?.enable();

      this.searchControlPersons.setValidators([Validators.required]);
      this.searchControlPersons.enable();
    } else {
      nameControl?.setValidators([Validators.required]);
      nameControl?.enable();

      personControl?.clearValidators();
      personControl?.disable();
      personControl?.setValue('');

      this.searchControlPersons.clearValidators();
      this.searchControlPersons.setValue('');
      this.searchControlPersons.disable();
    }

    nameControl?.updateValueAndValidity();
    personControl?.updateValueAndValidity();
    this.searchControlPersons.updateValueAndValidity();
  }

  handleIsMemberChange(): boolean {
    return this.familyForm.get('is_member')?.value;
  }

  getErrorMessage(controlName: string) {
    const control = this.familyForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit() {
    this.familyForm.markAllAsTouched();
    this.searchControlPersons.markAsTouched();
    this.searchControlKinship.markAsTouched();

    if (this.familyForm.valid) {
      const formValid = this.familyForm.getRawValue();
      this.dialogRef.close(formValid);
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
      return;
    }
  }
}
