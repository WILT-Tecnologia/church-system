import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Person } from 'app/model/Person';

import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [NotFoundRegisterComponent, CommonModule, CrudComponent],
  providers: [FormatsPipe],
})
export class PersonsComponent implements OnInit {
  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
    private personsService: PersonsService,
  ) {}

  persons: Person[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Person>(this.persons);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'cpf', header: 'CPF', type: 'cpf' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'sex', header: 'Sexo', type: 'sex' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (person: Person) => this.handleEdit(person),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (person: Person) => this.handleDelete(person),
    },
  ];

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons = () => {
    this.personsService.getPersons().subscribe({
      next: (data) => {
        this.persons = data;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  onCreate = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionando uma pessoa',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loadPersons();
      }
    });
  };

  handleEdit = (person: Person) => {
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

  handleDelete = (person: Person) => {
    this.confirmService
      .openConfirm(
        'Atenção',
        `Você tem certeza que deseja excluir o registro da pessoa ${person.name}?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loading.show();
          this.personsService.deletePerson(person).subscribe({
            next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
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
