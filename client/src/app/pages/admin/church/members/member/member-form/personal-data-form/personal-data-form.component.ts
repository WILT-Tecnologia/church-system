import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { Church } from 'app/model/Church';
import { ColorRace, EstadoCivil, Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { map, Observable, startWith } from 'rxjs';
import { MembersService } from '../../../members.service';
import { AddChurchDialogComponent } from '../components/modal/add-church-dialog/add-church-dialog.component';
import { AddPersonDialogComponent } from '../components/modal/add-person-dialog/add-person-dialog.component';

type Selects = {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-personal-data-form',
  templateUrl: './personal-data-form.component.html',
  styleUrls: ['./personal-data-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
  ],
})
export class PersonalDataFormComponent implements OnInit {
  memberForm: FormGroup;
  memberId: string | null = null;
  isEditMode: boolean = false;
  searchControl = new FormControl();
  searchChurchControl = new FormControl();
  filteredPerson$: Observable<Person[]>;
  filteredChurch$: Observable<Church[]>;
  activeTabIndex: number = 0;
  isSelectOpen: boolean = true;
  persons: Person[] = [];
  churchs: Church[] = [];

  // Listas de opções usando os enums
  colorRaceOptions: Selects[] = Object.keys(ColorRace).map((key) => ({
    value: ColorRace[key as keyof typeof ColorRace],
    viewValue: ColorRace[key as keyof typeof ColorRace],
  }));

  civilStatusOptions: Selects[] = Object.keys(EstadoCivil).map((key) => ({
    value: EstadoCivil[key as keyof typeof EstadoCivil],
    viewValue: EstadoCivil[key as keyof typeof EstadoCivil],
  }));

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    private validationService: ValidationService,
    public navigationService: NavigationService
  ) {
    this.memberForm = this.fb.group({
      person_id: ['', [Validators.required]],
      church_id: ['', [Validators.required]],
      rg: ['', [Validators.required, Validators.maxLength(15)]],
      issuing_body: ['', [Validators.required, Validators.maxLength(255)]],
      civil_status: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      naturalness: ['', [Validators.required]],
      color_race: ['', [Validators.required]],
    });
    this.filteredPerson$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterPerson(searchTerm ?? ''))
    );

    this.filteredChurch$ = this.searchChurchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterChurch(searchTerm ?? ''))
    );

    this.navigationService.activeTabIndex$.subscribe((index) => {
      this.activeTabIndex = index;
    });
  }

  ngOnInit() {}

  getErrorMessage(controlName: string) {
    const control = this.memberForm.get(controlName);
    if (control) return this.validationService.getErrorMessage(control);
    return null;
  }

  openAddPersonModal() {
    const dialogRef = this.dialog.open(AddPersonDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchPerson();
      }
    });
  }

  openAddChurchModal() {
    const dialogRef = this.dialog.open(AddChurchDialogComponent, {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '90vh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchChurch();
      }
    });
  }

  handleBack = () => {
    this.core.handleBack();
  };

  handleSubmit = () => {
    if (this.memberForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateMember();
    }
  };

  createMember = () => {
    this.loadingService.show();
    this.membersService.createMember(this.memberForm.value).subscribe({
      next: () => {
        this.loadingService.hide();
        this.snackbarService.openSuccess('Membro criado com sucesso.');
        this.core.handleBack();
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError(
          'Erro ao criar o membro. Verifique os dados e tente novamente.'
        );
      },
    });
    this.loadingService.hide();
  };

  handleEditMode = () => {
    this.loadingService.show();
    this.membersService
      .getMemberById(this.memberId!)
      .subscribe((member: Members) => {
        const formattedMembers = dayjs(member.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss'
        );

        this.memberForm.patchValue({
          ...member,
          updated_at: formattedMembers,
        });

        this.loadingService.hide();
      });
    this.loadingService.hide();
  };

  updateMember = () => {
    this.loadingService.show();
    this.membersService
      .updateMember(this.memberId!, this.memberForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess('Membro atualizado com sucesso.');
          this.core.handleBack();
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError(
            `Erro ao atualizar o membro ${
              this.memberForm.get('name')?.value
            }. Tente novamente.`
          );
        },
      });
    this.loadingService.hide();
  };

  fetchPerson() {
    this.membersService.getPersons().subscribe({
      next: (person) => {
        this.persons = person.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredPerson$ = this.searchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterPerson(searchTerm ?? ''))
        );
      },
      error: () => {
        this.snackbarService.openError('Erro ao buscar a pessoa.');
      },
    });
  }

  fetchChurch() {
    this.membersService.getChurch().subscribe({
      next: (church) => {
        this.churchs = church.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredChurch$ = this.searchChurchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterChurch(searchTerm ?? ''))
        );
      },
      error: () => {
        this.snackbarService.openError('Erro ao buscar o igreja.');
      },
    });
  }

  filterPerson(searchTerm: string): Person[] {
    return this.persons.filter((person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filterChurch(searchTerm: string): Church[] {
    return this.churchs.filter((church) =>
      church.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getPersonName(): string {
    const personId = this.memberForm.get('person_id')?.value;
    if (personId) {
      const person = this.persons.find((r) => r.id === personId);
      return person?.name ?? '';
    }
    return personId ? 'Selecione a pessoa' : 'Selecione a pessoa';
  }

  getChurchName(): string {
    const churchId = this.memberForm.get('church_id')?.value;
    if (churchId) {
      const church = this.churchs.find((r) => r.id === churchId);
      return church?.name ?? '';
    }

    return churchId ? 'Selecione a igreja' : 'Selecione a igreja';
  }

  onSelectOpenedChangePerson(isOpen: boolean) {
    if (isOpen) {
      this.fetchPerson();
    }
  }

  onSelectOpenedChangeChurch(isOpen: boolean) {
    if (isOpen) {
      this.fetchChurch();
    }
  }
}
