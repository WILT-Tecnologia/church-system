import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Person } from 'app/model/Person';
import { MESSAGES } from 'app/utils/messages';
import { CrudComponent } from '../../../../components/crud/crud.component';
import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
    CrudComponent,
  ],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Person>(this.persons);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'cpf', header: 'CPF', type: 'cpf' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'sex', header: 'Sexo', type: 'sex' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private personsService: PersonsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons = () => {
    this.personsService.getPersons().subscribe({
      next: (response) => {
        this.persons = response;
        this.dataSourceMat.data = this.persons;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewPerson = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionando uma pessoa',
      true,
      true,
      {},
    );

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loadPersons();
      }
    });
  };

  editPerson = (person: Person) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      `Editando a pessoa: ${person.name}`,
      true,
      true,
      { person },
    );

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loadPersons();
      }
    });
  };

  deletePerson = (person: Person) => {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      'Você tem certeza que deseja excluir o registro?',
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loading.show();
        this.personsService.deletePerson(person.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadPersons();
            this.loading.hide();
          },
        });
      }
    });
  };
}
