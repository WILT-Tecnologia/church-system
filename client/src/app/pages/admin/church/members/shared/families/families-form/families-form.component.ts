import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { PersonComponent } from 'app/pages/admin/administrative/persons/person/person.component';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import { debounceTime, forkJoin, map, Observable, startWith } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { Kinships } from 'app/model/Auxiliaries';
import { MESSAGES } from 'app/service/snackbar/messages';
import dayjs from 'dayjs';
import { MemberComponent } from '../../../member-form/member-form.component';
import { FamiliesService } from '../families.service';

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrl: './families-form.component.scss',
  standalone: true,
  imports: [
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
export class FamiliesFormComponent {
  familyId: string | null = null;
  familyForm: FormGroup;
  isEditMode: boolean = false;
  searchControlMembers = new FormControl('');
  searchControlPersons = new FormControl('');
  searchControlKinship = new FormControl('');

  filterMembers: Observable<Members[]>;
  filterPersons: Observable<Person[]>;
  filterKinships: Observable<Kinships[]>;

  families: Families[] = [];
  members: Members[] = [];
  persons: Person[] = [];
  kinships: Kinships[] = [];

  isMember = signal(false);
  showNameField = signal(true);
  dataSourceMat = new MatTableDataSource<Families>(this.families);

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private familiesService: FamiliesService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FamiliesFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { families: Families; defaultMemberId?: string },
  ) {
    this.familyForm = this.createForm();

    if (this.data?.defaultMemberId) {
      this.familyForm.get('member_id')?.setValue(this.data.defaultMemberId);
    }

    this.filterMembers = this.setupFilter(
      this.searchControlMembers,
      this.members,
      'person.name',
    );
    this.filterPersons = this.setupFilter(
      this.searchControlPersons,
      this.persons,
      'name',
    );
    this.filterKinships = this.setupFilter(
      this.searchControlKinship,
      this.kinships,
      'name',
    );
  }

  ngOnInit() {
    this.loadInitialData();
    if (this.data && this.data?.families) {
      this.isEditMode = true;
      this.familyId = this.data?.families.id;
      this.handleEdit();
    }
  }

  get pageTitle() {
    return this.isEditMode ? `Editando filiação` : `Cadastrar filiação`;
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.families?.id || ''],
      name: [this.data?.families?.name || '', [Validators.required]],
      is_member: [this.data?.families?.is_member || false],
      member_id: [
        {
          value: this.data?.families?.member?.id || '',
          disabled: !this.isMember,
        },
        [Validators.required],
      ],
      person_id: [
        {
          value: this.data?.families?.person?.id || '',
          disabled: this.isMember,
        },
      ],
      kinship_id: [
        this.data?.families?.kinship?.id || '',
        [Validators.required],
      ],
      updated_at: [this.data?.families?.updated_at || ''],
    });
  }

  loadFamilies() {
    this.loadingService.show();
    this.familiesService.getFamilies().subscribe({
      next: (families) => {
        this.families = families;
        this.dataSourceMat.data = this.families;
      },
      error: () => {
        this.onError(MESSAGES.LOADING_ERROR);
      },
      complete: () => {
        this.loadingService.hide();
      },
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

        this.filterMembers = this.setupFilter(
          this.searchControlMembers,
          this.members,
          'person.name',
        );
        this.filterPersons = this.setupFilter(
          this.searchControlPersons,
          this.persons,
          'name',
        );
        this.filterKinships = this.setupFilter(
          this.searchControlKinship,
          this.kinships,
          'name',
        );
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
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
      map((searchTerm) => {
        const term = (searchTerm ?? '').toLowerCase();

        return items
          .filter((item) => {
            const fieldValue = this.getFieldValue(item, field);
            return fieldValue && fieldValue.toLowerCase().includes(term);
          })
          .sort((a, b) => {
            const aValue = this.getFieldValue(a, field) ?? '';
            const bValue = this.getFieldValue(b, field) ?? '';
            return aValue.localeCompare(bValue);
          });
      }),
    );
  }

  getFieldValue(item: any, field: string): string | undefined {
    return field.split('.').reduce((acc, part) => acc?.[part], item);
  }

  onCheckboxChange(event: boolean) {
    const nameControl = this.familyForm.get('name');
    const personControl = this.familyForm.get('person_id');

    this.isMember.set(event);

    if (event) {
      nameControl?.clearValidators();
      nameControl?.disable();
      nameControl?.setValue(null);
      personControl?.setValidators([Validators.required]);
      personControl?.enable();
      this.showNameField.set(false);
    } else {
      nameControl?.setValidators([Validators.required]);
      nameControl?.enable();
      personControl?.clearValidators();
      personControl?.disable();
      personControl?.setValue(null);
      this.showNameField.set(true);
    }

    nameControl?.updateValueAndValidity();
    personControl?.updateValueAndValidity();
  }

  personExists(): boolean {
    return this.isMember();
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
    return this.getName('person_id', this.persons, 'Selecione a pessoa');
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
    return this.getName('kinship_id', this.kinships, 'Selecione o parentesco');
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

    const familyData = { ...this.familyForm.value };

    if (familyData.is_member) {
      familyData.name = null;
    }

    if (!familyData.is_member) {
      familyData.person_id = null;
    }

    this.isEditMode
      ? this.updateMember(familyData.id, familyData)
      : this.handleCreate(familyData);
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.snackbarService.openSuccess(message);
    this.dialogRef.close(this.familyForm.value);
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

  openAddMemberDialog() {
    this.dialog.open(MemberComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: this.members,
    });
  }

  openAddPersonDialog() {
    this.dialog.open(PersonComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: this.persons,
    });
  }
}
