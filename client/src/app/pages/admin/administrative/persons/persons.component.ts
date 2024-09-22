import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Person } from '../../../../model/Person';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [
    MatCardModule,
    TableComponent,
    MatIconModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class PersonsComponent implements OnInit {
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

  constructor(
    private personsService: PersonsService,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons = () => {
    this.personsService.getPersons().subscribe((persons) => {
      this.persons = persons;
    });
  };

  addNewPerson = (): void => {
    const dialogRef = this.dialog.open(PersonComponent, {
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((newPerson) => {
      if (newPerson) this.loadPersons();
    });
  };

  editPerson = (person: Person): void => {
    const dialogRef = this.dialog.open(PersonComponent, {
      id: person.id,
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: { person },
    });

    dialogRef.afterClosed().subscribe((updatedPerson) => {
      if (updatedPerson) this.loadPersons();
    });
  };

  deletePerson = (person: Person): void => {
    this.confirmService
      .openConfirm(
        'Atenção',
        'Você tem certeza que deseja excluir o registro?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loading.show();
          this.personsService.deletePerson(person.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess('Pessoa excluída com sucesso!');
              this.loadPersons();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError(
                'Erro ao excluir a pessoa. Tente novamente.',
              );
            },
            complete: () => {
              this.loading.hide();
            },
          });
        }
      });
  };
}
