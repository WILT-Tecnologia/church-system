import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TableComponent } from '../../../../components/table/table.component';
import { Person } from '../../../../model/Person';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [MatCardModule, TableComponent, MatDialogModule],
})
export class PersonsComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private personsService: PersonsService
  ) {}

  persons: Person[] = [];
  displayedColumns: string[] = [
    'name',
    'cpf',
    'birth_date',
    'email',
    'phone_one',
    'sex',
    'created_at',
    'updated_at',
    'actions',
  ];
  columnDefinitions = {
    name: 'Nome',
    cpf: 'CPF',
    birth_date: 'Data de Nascimento',
    email: 'Email',
    phone_one: 'Celular',
    sex: 'Sexo',
    created_at: 'Criado em',
    updated_at: 'Atualizado em',
    actions: 'Ações',
  };

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons(): void {
    this.personsService.getPersons().subscribe((persons) => {
      this.persons = persons;
    });
  }

  addNewPerson = (): void => {
    this.router.navigate(['persons/new']);
  };

  editPerson = (person: Person): void => {
    this.router.navigate(['persons/edit', person.id]);
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
