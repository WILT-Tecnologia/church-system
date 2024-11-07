import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from 'app/components/column/column.component';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { Kinships } from 'app/model/Auxiliaries';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { PersonComponent } from 'app/pages/admin/administrative/persons/person/person.component';
import { MESSAGES } from 'app/service/snackbar/messages';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import { debounceTime, forkJoin, map, Observable, startWith } from 'rxjs';
import { FamiliesService } from '../families.service';

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrl: './families-form.component.scss',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatCheckboxModule,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
  ],
})
export class FamiliesFormComponent implements OnInit {
  familyId: string | null = null;
  familyForm: FormGroup = {} as any;
  isEditMode: boolean = false;
  searchControlMembers = new FormControl();
  searchControlPersons = new FormControl();
  searchControlKinship = new FormControl();

  filterMembers$: Observable<Members[]> = new Observable<Members[]>();
  filterPersons$: Observable<Person[]> = new Observable<Person[]>();
  filterKinships$: Observable<Kinships[]> = new Observable<Kinships[]>();

  families: Families[] = [];
  members: Members[] = [];
  persons: Person[] = [];
  kinships: Kinships[] = [];

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private familiesService: FamiliesService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private modalService: ModalService,
    private dialogRef: MatDialogRef<FamiliesFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { families: Families },
  ) {
    this.familyForm = this.createForm();

    this.checkEditMode();
  }

  ngOnInit() {
    this.loadInitialData();
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
      updated_at: [this.data?.families?.updated_at ?? ''],
    });
  }

  private getFieldValue(item: any, field: string): string | undefined {
    return field.split('.').reduce((acc, part) => acc?.[part], item);
  }

  setupFilter(
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
    this.filterMembers$ = this.setupFilter(
      this.searchControlMembers,
      this.members,
      'person.name',
    );
    this.filterPersons$ = this.setupFilter(
      this.searchControlPersons,
      this.persons,
      'name',
    );
    this.filterKinships$ = this.setupFilter(
      this.searchControlKinship,
      this.kinships,
      'name',
    );
  }

  loadInitialData() {
    forkJoin({
      members: this.familiesService.getMembers(),
      persons: this.familiesService.getPersons(),
      kinships: this.familiesService.getKinships(),
    }).subscribe({
      next: ({ members, persons, kinships }) => {
        this.members = members;
        this.persons = persons;
        this.kinships = kinships;
        this.searchControlMembers = this.familyForm.get(
          'member_id',
        ) as FormControl;
        this.searchControlPersons = this.familyForm.get(
          'person_id',
        ) as FormControl;
        this.searchControlKinship = this.familyForm.get(
          'kinship_id',
        ) as FormControl;
      },
      error: () => this.snackbarService.openError(MESSAGES.LOADING_ERROR),
    });
  }

  private checkEditMode() {
    if (this.data && this.data?.families) {
      this.isEditMode = true;
      this.familyId = this.data?.families.id;
      this.handleEdit();
    } else {
      const defaultMemberId = this.data?.families?.member?.id || '';
      this.familyForm.get('member_id')?.setValue(defaultMemberId);
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

  displayNameMember(): string {
    const memberId = this.familyForm.get('member_id')?.value;
    const selectedMember = this.members.find(
      (member) => member.id === memberId,
    );
    return selectedMember ? selectedMember.person.name : 'Selecione o membro';
  }

  displayNamePerson = (): string => {
    const personId = this.familyForm.get('person_id')?.value;
    if (personId) {
      const person = this.persons.find((r) => r.id === personId);
      return person?.name ?? 'Selecione a pessoa';
    }
    return 'Selecione a pessoa';
  };

  displayNameKinship = (): string => {
    const kinshipId = this.familyForm.get('kinship_id')?.value;
    if (kinshipId) {
      const kinship = this.kinships.find((r) => r.id === kinshipId);
      return kinship?.name ?? 'Selecione o parentesco';
    }
    return 'Selecione o parentesco';
  };

  getErrorMessage(controlName: string) {
    const control = this.familyForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (this.familyForm.invalid) return;

    const familyData = this.getFormData();
    console.log('handleSubmit', familyData);

    if (this.isEditMode) {
      familyData.id = this.familyId;
    }

    this.isEditMode
      ? this.updateMember(this.familyId!, familyData)
      : this.handleCreate(familyData);
  }

  private getFormData(): any {
    return {
      ...this.familyForm.value,
      name: this.familyForm.value.is_member ? '' : this.familyForm.value.name,
      member_id: this.familyForm.value.member_id,
      person_id: this.familyForm.value.person_id,
      kinship_id: this.familyForm.value.kinship_id,
    };
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.snackbarService.openSuccess(message);
    this.dialogRef.close();
  }

  onError(message: string) {
    this.loadingService.hide();
    this.snackbarService.openError(message);
  }

  handleCreate(familyData?: any) {
    this.loadingService.show();
    this.familiesService.createFamily(familyData).subscribe({
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

  handleEdit() {
    this.familiesService
      .getFamily(this.familyId!)
      .subscribe((family: Families) => {
        this.familyForm.patchValue({
          id: family.id,
          name: family.name ?? '',
          member_id: family.member ? family.member?.id : '',
          person_id: family.person ? family.person?.id : '',
          kinship_id: family.kinship ? family.kinship?.id : '',
          is_member: family.is_member,
        });
        this.onCheckboxChange(family.is_member);
      });
  }

  openAddPersonDialog() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionar pessoa',
      true,
      [],
      true,
    );
  }
}
