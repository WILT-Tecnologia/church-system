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
  providers: [
    {
      provide: MAT_DIALOG_DATA,
      useValue: {},
    },
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

  members: Members[] = [];
  persons: Person[] = [];
  kinships: Kinships[] = [];

  memberExists = signal(false);

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
    if (this.data && this.data?.families) {
      this.isEditMode = true;
      this.familyId = this.data?.families?.id;
      this.familyForm.patchValue(this.data.families);
      this.handleEdit();
    }
    this.loadFamilies();
    console.log('this.data', this.loadFamilies());
  }

  get pageTitle() {
    return this.isEditMode ? `Editando filiação` : `Cadastrar filiação`;
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.families?.id || ''],
      name: [this.data?.families?.name || '', [Validators.required]],
      member_id: [this.data?.families?.member_id || '', [Validators.required]],
      person_id: [this.data?.families?.person_id || '', [Validators.required]],
      kinship_id: [
        this.data?.families?.kinship_id || '',
        [Validators.required],
      ],
      updated_at: [this.data?.families?.updated_at || ''],
    });
  }

  loadFamilies() {
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
          .filter((item) => item[field].toLowerCase().includes(term))
          .sort((a, b) => a[field].localeCompare(b[field]));
      }),
    );
  }

  onCheckboxChange(event: any) {
    this.memberExists.set(event.checked);
  }

  getName(controlName: string, items: any[], defaultName: string): string {
    const id = this.familyForm.get(controlName)?.value;
    const item = items.find((r) => r.id === id);
    return item?.name ?? defaultName;
  }

  getPersonName(): string {
    return this.getName('person_id', this.persons, 'Selecione a pessoa');
  }

  getMemberName(): string {
    return this.getName('member_id', this.members, 'Selecione o membro');
  }

  getKinshipName(): string {
    return this.getName('kinship_id', this.kinships, 'Selecione o parentesco');
  }

  getErrorMessage(controlName: string) {
    const control = this.familyForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleError(error: any) {
    this.snackbarService.openError(error.message);
    this.loadingService.hide();
  }

  handleBack() {
    this.dialogRef.close();
  }

  handleSubmit() {
    if (this.familyForm.invalid) return;

    const familyData = this.familyForm.value;
    this.isEditMode ? this.updateMember(familyData.id) : this.handleCreate();
  }

  handleCreate() {
    this.loadingService.show();
    this.familiesService.createFamily(this.familyForm.value).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Familia criada com sucesso!');
        this.dialogRef.close();
      },
      error: (error) => this.handleError(error),
      complete: () => this.loadingService.hide(),
    });
  }

  updateMember(familyId: string) {
    this.loadingService.show();
    this.familiesService
      .updateFamily(familyId, this.familyForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Familia atualizada com sucesso!');
          this.dialogRef.close();
        },
        error: (error) => this.handleError(error),
        complete: () => this.loadingService.hide(),
      });
  }

  handleEdit() {
    this.familiesService.getFamily(this.familyId!).subscribe({
      next: (family) => {
        this.familyForm.patchValue(family);
      },
      error: (error) => this.handleError(error),
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
