import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from 'app/components/column/column.component';

import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Kinships } from 'app/model/Auxiliaries';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { PersonComponent } from 'app/pages/admin/administrative/persons/person/person.component';
import { MESSAGES } from 'app/utils/messages';
import { ValidationService } from 'app/utils/validation/validation.service';
import { forkJoin, map, Observable, startWith, Subject } from 'rxjs';
import { ActionsComponent } from '../../../../../../../components/actions/actions.component';
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
  members: Members[] = [];
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
    console.log(this.data);
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

  showAllMembers() {
    this.filterMembers = this.searchControlMembers.valueChanges.pipe(
      startWith(this.familyForm.value),
      map((value: any) => {
        if (typeof value === 'string') {
          return value;
        } else {
          return value ? value.name : '';
        }
      }),
      map((name) =>
        name?.length >= 1 ? this._filterMembers(name) : this.members,
      ),
    );
  }

  showAllPersons() {
    this.filterPersons = this.searchControlPersons.valueChanges.pipe(
      startWith(this.familyForm.value),
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
      startWith(this.familyForm.value),
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
      members: this.familiesService.getMembers(),
      persons: this.familiesService.getPersons(),
      kinships: this.familiesService.getKinships(),
    }).subscribe({
      next: ({ members, persons, kinships }) => {
        this.members = members;
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

  private _filterMembers(name: string): Members[] {
    const filterValue = name.toLowerCase();
    return this.members.filter((member) =>
      member?.person?.name.toLowerCase().includes(filterValue),
    );
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

  onMemberSelected(event: MatAutocompleteSelectedEvent) {
    const member = event.option.value;
    this.searchControlMembers.setValue(member?.person?.name);
    this.familyForm.get('member_id')?.setValue(member.id);
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

  checkEditMode() {
    if (this.data?.families?.id) {
      this.isEditMode = true;
      this.onCheckboxChange(this.data.families?.is_member);

      if (this.data?.families.member) {
        this.searchControlMembers.setValue(
          this.data?.families?.member?.person?.name,
        );
        this.familyForm
          .get('member_id')
          ?.setValue(this.data?.families?.member?.id);
      }
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
    this.loadInitialData();
  }

  onError(message: string) {
    this.loadingService.hide();
    this.toast.openError(message);
  }

  handleBack() {
    this.dialogRef.close();
  }

  private getFormData() {
    return {
      id: this.data?.families?.id ?? '',
      is_member: this.handleIsMemberChange(),
      name: this.familyForm.value.is_member ? '' : this.familyForm.value.name,
      member_id: this.familyForm.value.member_id,
      person_id: this.familyForm.value.person_id,
      kinship_id: this.familyForm.value.kinship_id,
    };
  }

  handleSubmit() {
    const family = this.familyForm.value;
    if (!family) return;

    const familyData = this.getFormData();

    if (this.isEditMode) {
      this.updateMember(familyData.id, familyData);
    } else {
      this.handleCreate(familyData);
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
