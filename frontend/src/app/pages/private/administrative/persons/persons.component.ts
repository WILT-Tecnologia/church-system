import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Person } from 'app/model/Person';
import { AuthService } from 'app/services/auth/auth.service';
import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [CrudComponent],
  providers: [FormatsPipe],
})
export class PersonsComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private personsService = inject(PersonsService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_pessoas');
  private deletePermission = this.authService.hasPermission('delete_administrative_pessoas');
  persons = signal<Person[]>([]);
  dataSourceMat = new MatTableDataSource<Person>([]);
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
      color: 'inherit',
      action: (person: Person) => this.onEdit(person),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (person: Person) => this.onDelete(person),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons() {
    this.loading.show();
    this.personsService.getPersons().subscribe({
      next: (data) => {
        this.persons.set(data);
        this.dataSourceMat.data = data;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionando pessoa',
      true,
      true,
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadPersons();
      }
    });
  }

  onEdit(person: Person) {
    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      `Editando a pessoa: ${person.name}`,
      true,
      true,
      { person },
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadPersons();
      }
    });
  }

  onDelete(person: Person) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o registro da pessoa ${person.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loading.show();
        this.personsService.deletePerson(person).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadPersons(),
        });
      }
    });
  }
}
