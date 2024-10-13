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
import { Kinships } from 'app/model/Auxiliaries';
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

  constructor(
    private fb: FormBuilder,
    private snackbarService: SnackbarService,
    private familiesService: FamiliesService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FamiliesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { families: Families },
  ) {
    this.familyForm = this.createForm();

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
      this.familyId = this.data?.families?.id;
      this.familyForm.patchValue(this.data.families);
      this.handleEdit();
    }
  }

  get pageTitle() {
    return this.isEditMode ? `Editando filiação` : `Cadastrar filiação`;
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.families?.id || ''],
      name: [
        { value: this.data?.families?.name || '', disabled: this.isMember },
      ],
      member_id: [
        {
          value: this.data?.families?.member.id || '',
          disabled: !this.isMember,
        },
        [Validators.required],
      ],
      person_id: [this.data?.families?.person.id || '', [Validators.required]],
      kinship_id: [
        this.data?.families?.kinship.id || '',
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
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
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

  onCheckboxChange(event: any) {
    const nameControl = this.familyForm.get('name');
    const memberControl = this.familyForm.get('member_id');

    this.isMember.set(event.checked);

    if (event.checked) {
      nameControl?.setValidators([Validators.required]);
      nameControl?.enable();
      memberControl?.clearValidators();
      memberControl?.disable();
      memberControl?.setValue(null);
    } else {
      nameControl?.clearValidators();
      nameControl?.disable();
      nameControl?.setValue(null);
      memberControl?.setValidators([Validators.required]);
      memberControl?.enable();
    }

    nameControl?.updateValueAndValidity();
    memberControl?.updateValueAndValidity();
  }

  memberExists(): boolean {
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

    const familyData = this.familyForm.value;
    this.isEditMode ? this.updateMember(familyData.id) : this.handleCreate();
  }

  onSuccess(message: string) {
    this.loadingService.hide();
    this.snackbarService.openSuccess(message);
    this.loadFamilies();
  }

  onError(message: string) {
    this.loadingService.hide();
    this.snackbarService.openError(message);
  }

  handleCreate() {
    this.loadingService.show();
    this.familiesService.createFamily(this.familyForm.value).subscribe({
      next: () => this.onSuccess('Familia criada com sucesso.'),
      error: () => this.onError('Erro ao criar a familia.'),
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  updateMember(familyId: string) {
    this.loadingService.show();
    this.familiesService
      .updateFamily(familyId, this.familyForm.value)
      .subscribe({
        next: () => this.onSuccess('Familia atualizada com sucesso.'),
        error: () => this.onError('Erro ao atualizar a familia.'),
        complete: () => this.loadingService.hide(),
      });
  }

  handleEdit() {
    this.familiesService.getFamily(this.familyId!).subscribe({
      next: (family) => {
        this.familyForm.patchValue(family);
      },
      error: () => this.onError('Erro ao carregar a familia.'),
      complete: () => this.loadingService.hide(),
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
