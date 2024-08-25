import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingService } from '../../../../components/loading/loading.service';
import { TableComponent } from '../../../../components/table/table.component';
import { Person } from '../../../../model/Person';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [
    MatCardModule,
    MatTableModule,
    TableComponent,
    MatDialogModule,
    MatIconModule,
  ],
})
export class PersonsComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private personsService: PersonsService,
    private loadingService: LoadingService
  ) {}

  persons: Person[] = [];
  displayedColumns: string[] = [
    'name',
    'cpf',
    'birth_date',
    'email',
    'sex',
    'actions',
  ];
  columnDefinitions = {
    name: 'Nome',
    cpf: 'CPF',
    birth_date: 'Data de Nascimento',
    email: 'Email',
    sex: 'Sexo',
    actions: 'Ações',
  };

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons = () => {
    this.personsService.getPersons().subscribe((persons) => {
      this.persons = persons;
    });
  };

  addNewPerson = (): void => {
    this.router.navigate(['administrative/persons/person/new']);
  };

  editPerson = (person: Person): void => {
    this.router.navigate(['administrative/persons/person/edit', person.id]);
  };

  deletePerson = (person: Person): void => {
    this.personsService.deletePerson(person.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Pessoa excluída com sucesso!');
        this.loadPersons();
      },
      error: () => {
        this.snackbarService.openError(
          'Erro ao excluir a pessoa. Tente novamente mais tarde.'
        );
      },
    });
  };
}
