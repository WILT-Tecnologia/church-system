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
import { MatTableDataSource } from '@angular/material/table';
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
import dayjs from 'dayjs';
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
  familyForm: FormGroup;
  isEditMode: boolean = false;
  searchControlMembers = new FormControl('');
  searchControlPersons = new FormControl('');
  searchControlKinship = new FormControl('');

  filterMembers$: Observable<Members[]>;
  filterPersons$: Observable<Person[]>;
  filterKinships$: Observable<Kinships[]>;

  families: Families[] = [];
  members: Members[] = [];
  persons: Person[] = [];
  kinships: Kinships[] = [];

  isMember: boolean = false;
  showNameField: boolean = true;
  dataSourceMat = new MatTableDataSource<Families>(this.families);

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

    if (this.data?.families?.id || '') {
      this.familyForm.get('member_id')?.setValue(this.data?.families?.id || '');
    }

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

  ngOnInit() {
    /*this.loadInitialData();
    if (this.data && this.data?.families) {
      this.isEditMode = true;
      this.familyId = this.data?.families.id;
      this.handleEdit();
    }*/
  }

  get pageTitle() {
    return this.isEditMode ? `Editando filiação` : `Cadastrar filiação`;
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.families?.id],
      name: [this.data?.families?.name, [Validators.required]],
      is_member: [this.data?.families?.is_member],
      member_id: [
        {
          value: this.data?.families?.member?.id,
          disabled: false,
        },
        [Validators.required],
      ],
      person_id: [
        {
          value: this.data?.families?.person?.id,
          disabled: true,
        },
      ],
      kinship_id: [this.data?.families?.kinship?.id, [Validators.required]],
      updated_at: [this.data?.families?.updated_at],
    });
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
      },
      error: () => this.snackbarService.openError(MESSAGES.LOADING_ERROR),
    });
  }

  setupFilter(
    control: FormControl,
    items: any[],
    field: string,
  ): Observable<any[]> {
    return control.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) =>
        items.filter((item) =>
          this.getFieldValue(item, field)
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
        ),
      ),
    );
  }

  getFieldValue(item: any, field: string): string | undefined {
    return field.split('.').reduce((acc, part) => acc?.[part], item);
  }

  onCheckboxChange(event: boolean) {
    const nameControl = this.familyForm.get('name');
    const personControl = this.familyForm.get('person_id');

    this.isMember = event;

    if (event) {
      nameControl?.clearValidators();
      nameControl?.disable();
      nameControl?.setValue(null);
      personControl?.setValidators([Validators.required]);
      personControl?.enable();
      this.showNameField = false;
    } else {
      nameControl?.setValidators([Validators.required]);
      nameControl?.enable();
      personControl?.clearValidators();
      personControl?.disable();
      personControl?.setValue(null);
      this.showNameField = true;
    }

    nameControl?.updateValueAndValidity();
    personControl?.updateValueAndValidity();
  }

  personExists(): boolean {
    return this.isMember;
  }

  getName(
    controlName: string,
    items: any[],
    defaultName: string,
    nestedProperty?: string,
  ): string {
    const id = this.familyForm.get(controlName)?.value;
    const item = items.find((r) => r.id === id);

    if (item) {
      if (nestedProperty) {
        const nestedKeys = nestedProperty.split('.');
        return nestedKeys.reduce((o, k) => (o || {})[k], item) ?? defaultName;
      }
      return item.name ?? defaultName;
    }

    return defaultName;
  }

  getPersonName(): string {
    return this.getName(
      'person_id',
      this.persons,
      'Selecione a pessoa',
      'name',
    );
  }

  getMemberName(): string {
    return this.getName(
      'member_id',
      this.members,
      'Selecione o membro',
      'person.name',
    );
  }

  getKinshipName(): string {
    return this.getName(
      'kinship_id',
      this.kinships,
      'Selecione o parentesco',
      'name',
    );
  }

  getErrorMessage(controlName: string) {
    const control = this.familyForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (this.familyForm.invalid) return;

    const familyData = {
      ...this.familyForm.value,
      name: this.familyForm.value.is_member ? null : this.familyForm.value.name,
    };

    this.isEditMode
      ? this.updateMember(this.familyId!, familyData)
      : this.handleCreate(familyData);
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
      next: (createdFamily) => {
        this.onSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef.close(createdFamily);
      },
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
          name: family.name,
          member_id: family?.member?.id || '',
          person_id: family?.person?.id || '',
          kinship_id: family?.kinship?.id || '',
          is_member: family.is_member,
          updated_at: dayjs(family.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
        this.onCheckboxChange(family.is_member);
      });
  }

  /*openAddMemberDialog() {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Adicionar membro',
      true,
      [],
      true,
    );
  }*/

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
