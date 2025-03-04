import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
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
import { forkJoin, map, Observable, startWith, Subject } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
import { ColumnComponent } from '../../../../../../../components/column/column.component';
import { LoadingService } from '../../../../../../../components/loading/loading.service';
import { ModalService } from '../../../../../../../components/modal/modal.service';
import { MESSAGES } from '../../../../../../../components/toast/messages';
import { ToastService } from '../../../../../../../components/toast/toast.service';
import { Kinships } from '../../../../../../../model/Auxiliaries';
import { Families } from '../../../../../../../model/Families';
import { Members } from '../../../../../../../model/Members';
import { Person } from '../../../../../../../model/Person';
import { ValidationService } from '../../../../../../../services/validation/validation.service';
import { PersonComponent } from '../../../../../administrative/persons/person/person.component';
import { FamiliesService } from '../families.service';

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrl: './families-form.component.scss',
  standalone: true,
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
    ActionsComponent,
  ],
})
export class FamiliesFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  familyForm: FormGroup;
  isEditMode: boolean = false;
  searchControlMembers = new FormControl('');
  searchControlPersons = new FormControl('');
  searchControlKinship = new FormControl('');

  families: Families[] = [];
  persons: Person[] = [];
  kinships: Kinships[] = [];

  filterMembers: Observable<Members[]> = new Observable<Members[]>();
  filterPersons: Observable<Person[]> = new Observable<Person[]>();
  filterKinships: Observable<Kinships[]> = new Observable<Kinships[]>();

  constructor(
    private familiesService: FamiliesService,
    private fb: FormBuilder,
    private toast: ToastService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private modalService: ModalService,
    private dialogRef: MatDialogRef<FamiliesFormComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { families: Families },
  ) {
    this.familyForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.data?.families?.id ?? ''],
      is_member: [this.data?.families?.is_member ?? false],
      member_id: [this.data?.families?.member?.id ?? '', [Validators.required]],
      name: [this.data?.families?.name ?? '', [Validators.required]],
      person_id: [
        {
          value: this.data?.families?.person?.id ?? '',
          disabled: true,
        },
      ],
      kinship_id: [
        this.data?.families?.kinship?.id ?? '',
        [Validators.required],
      ],
    });
  }

  showAllPersons() {
    this.filterPersons = this.searchControlPersons.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name?.length >= 1 ? this._filterPerson(name) : this.persons,
      ),
    );
  }

  showAllKinships() {
    this.filterKinships = this.searchControlKinship.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name?.length >= 1 ? this._filterKinships(name) : this.kinships,
      ),
    );
  }

  loadInitialData() {
    this.loadingService.show();
    forkJoin({
      persons: this.familiesService.getPersons(),
      kinships: this.familiesService.getKinships(),
    }).subscribe({
      next: ({ persons, kinships }) => {
        this.persons = persons;
        this.kinships = kinships;
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  private _filterPerson(name: string): Person[] {
    const filterValue = name.toLowerCase();
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(filterValue),
    );
  }

  private _filterKinships(name: string): Kinships[] {
    const filterValue = name.toLowerCase();
    return this.kinships.filter((kinship) =>
      kinship.name.toLowerCase().includes(filterValue),
    );
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

  handleCancel() {
    this.dialogRef.close();
  }

  private checkEditMode() {
    if (this.data?.families?.id) {
      this.isEditMode = true;
      this.onCheckboxChange(this.data.families?.is_member);
    }

    if (this.data.families.person) {
      this.searchControlPersons.setValue(this.data?.families?.person?.name);
      this.familyForm
        .get('person_id')
        ?.setValue(this.data?.families?.person?.id);
    }

    if (this.data.families.kinship) {
      this.searchControlKinship.setValue(this.data?.families?.kinship?.name);
      this.familyForm
        .get('kinship_id')
        ?.setValue(this.data?.families?.kinship?.id);
    }

    this.familyForm.patchValue({
      member_id: this.data?.families?.member?.id,
    });
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
    } else {
      nameControl?.setValidators([Validators.required]);
      nameControl?.enable();
      personControl?.clearValidators();
      personControl?.disable();
      personControl?.setValue('');
    }

    nameControl?.updateValueAndValidity();
    personControl?.updateValueAndValidity();
  }

  handleIsMemberChange(): boolean {
    return this.familyForm.get('is_member')?.value;
  }

  getErrorMessage(controlName: string) {
    const control = this.familyForm.get(controlName);
    return control?.errors
      ? this.validationService.getErrorMessage(control)
      : null;
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.familyForm.value);
  }

  onError(message: string) {
    this.loadingService.hide();
    this.toast.openError(message);
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    const family = this.familyForm.value;
    if (!family) return;

    if (this.isEditMode) {
      this.updateMember(family.id, family);
    } else {
      this.handleCreate(family);
    }
  }

  handleCreate(data: any) {
    this.loadingService.show();
    this.familiesService.createFamily(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  updateMember(familyId: string, familyData?: any) {
    this.loadingService.show();
    this.familiesService.updateFamily(familyId, familyData).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  openAddPersonDialog() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionar pessoa',
      true,
      true,
    );
  }
}
