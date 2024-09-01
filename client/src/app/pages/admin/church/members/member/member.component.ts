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
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';
import { map, Observable, startWith } from 'rxjs';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { Church } from '../../../../../model/Church';
import { Members } from '../../../../../model/Members';
import { Person } from '../../../../../model/Person';
import { CoreService } from '../../../../../service/core/core.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { MembersService } from '../members.service';
import { MemberFormComponent } from './member-form/member-form.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule,
    MatRadioModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MemberFormComponent,
  ],
})
export class MemberComponent implements OnInit {
  memberForm: FormGroup;
  isEditMode: boolean = false;
  memberId: string | null = null;
  searchControl = new FormControl();
  filteredPerson$!: Observable<Person[]>;
  filteredChurch$!: Observable<Church[]>;
  isSelectOpen: boolean = true;
  persons: Person[] = [];
  churchs: Church[] = [];

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService
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
      formation: ['', [Validators.required]],
      formation_course: ['', [Validators.required, Validators.maxLength(255)]],
      profission: ['', [Validators.required, Validators.maxLength(255)]],
      def_physical: [''],
      def_visual: [''],
      def_hearing: [''],
      def_intellectual: [''],
      def_mental: [''],
      def_multiple: [''],
      def_other: [''],
      def_other_description: ['', [Validators.maxLength(255)]],
      baptism_date: [''],
      baptism_locale: ['', [Validators.maxLength(255)]],
      baptism_official: ['', [Validators.maxLength(255)]],
      baptism_holy_spirit: [''],
      baptism_holy_spirit_date: [''],
      member_origin_id: [''],
      receipt_date: [''],
      updated_at: [''],
    });

    this.filteredPerson$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterPerson(searchTerm ?? ''))
    );
  }

  ngOnInit() {
    this.fetchPerson();
    this.memberId = this.route.snapshot.paramMap.get('id');
    if (this.memberId) {
      this.isEditMode = true;
      this.handleEditMode();
    }
  }

  get pageTitle() {
    return this.isEditMode ? `Editar membro` : `Cadastrar membro`;
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
    } else {
      this.createMember();
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
          `Erro ao criar o membro ${
            this.memberForm.get('name')?.value
          }. Tente novamente.`
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
    return 'Selecione a pessoa';
  }

  getChurchName(): string {
    const churchId = this.memberForm.get('church_id')?.value;
    if (churchId) {
      const church = this.churchs.find((r) => r.id === churchId);
      return church?.name ?? '';
    }

    return churchId ? 'Selecione a igreja' : 'Selecione a igreja';
  }

  onSelectOpenedChange(isOpen: boolean) {
    if (isOpen) {
      this.fetchPerson();
    }
  }
}
