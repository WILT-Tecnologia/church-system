import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
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
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { MemberComponent } from '../../members/member/member.component';
import { FamiliesService } from '../families.service';

@Component({
  selector: 'app-families-form',
  templateUrl: './families-form.component.html',
  styleUrl: './families-form.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
  ],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
  ],
})
export class FamiliesFormComponent {
  familyId: string | null = null;
  familyForm: FormGroup;
  isEditMode: boolean = false;
  searchControlMembers = new FormControl('');
  searchControlPersons = new FormControl('');
  searchPersons = new FormControl('');

  filterMembers: Observable<Members[]>;
  filterPersons: Observable<Person[]>;

  members: Members[] = [];
  persons: Person[] = [];

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

    this.filterMembers = this.searchControlMembers.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => {
        const items = (this as any).members || [];
        return items
          .filter((item: any) =>
            item.name.toLowerCase().includes(searchTerm?.toLowerCase()),
          )
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
    );
    this.filterPersons = this.searchControlPersons.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      map((searchTerm) => {
        const items = (this as any).persons || [];
        return items
          .filter((item: any) =>
            item.name.toLowerCase().includes(searchTerm?.toLowerCase()),
          )
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
    );
  }

  ngOnInit() {
    this.loadFamilies();
    if (this.data && this.data?.families) {
      this.isEditMode = true;
      this.familyId = this.data?.families?.id;
      this.familyForm.patchValue(this.data.families);
      this.handleEdit();
    }
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

  get pageTitle() {
    return this.isEditMode ? `Editando o membro` : `Cadastrar o membro`;
  }

  loadFamilies() {
    this.familiesService.getMembers().subscribe({
      next: (members) => {
        this.members = members;
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });

    this.familiesService.getPersons().subscribe({
      next: (persons) => {
        this.persons = persons;
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  }

  filterPerson(value: string): Person[] {
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  filterMember(value: string): Members[] {
    return this.members.filter((member) =>
      member.person.name.toLowerCase().includes(value.toLowerCase()),
    );
  }

  getPersonName(): string {
    const personId = this.familyForm.get('person_id')?.value;
    if (personId) {
      const person = this.persons.find((r) => r.id === personId);
      return person?.name ?? 'Selecione a pessoa';
    }
    return 'Selecione a pessoa';
  }

  getMemberName(): string {
    const memberId = this.familyForm.get('member_id')?.value;
    if (memberId) {
      const member = this.members.find((r) => r.id === memberId);
      return member?.person.name ?? 'Selecione o membro';
    }
    return 'Selecione o membro';
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

  handleCreate() {
    this.loadingService.show();
    this.familiesService.createFamily(this.familyForm.value).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Familia criada com sucesso!');
        this.dialogRef.close();
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
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
        error: (error) => {
          this.snackbarService.openError(error.message);
        },
        complete: () => this.loadingService.hide(),
      });
  }

  handleEdit() {
    this.familiesService.getFamily(this.familyId!).subscribe({
      next: (family) => {
        this.familyForm.patchValue(family);
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
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
