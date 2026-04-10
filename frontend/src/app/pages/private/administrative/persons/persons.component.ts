import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Person } from '@app/model/Person';
import { AuthService } from '@app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [CrudComponent],
})
export class PersonsComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private personsService = inject(PersonsService);
  private authService = inject(AuthService);
  public readonly permissionWrite = 'write_administrative_pessoas';
  public readonly permissionDelete = 'delete_administrative_pessoas';
  private writePermission = this.authService.hasPermission(this.permissionWrite);
  private deletePermission = this.authService.hasPermission(this.permissionDelete);

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
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Salvar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionando pessoa',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.personsService.createPerson(person).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadPersons(),
        });
      }
    });
  }

  onEdit(person: Person) {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Atualizar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      `Editando a pessoa: ${person.name}`,
      true,
      true,
      { person, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.personsService.updatePerson(person).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadPersons(),
        });
      }
    });
  }

  onDelete(person: Person) {
    const modal = this.confirmService.openConfirm(
      'Exclusão de pessoa',
      `Tem certeza que deseja excluir o registro da pessoa ${person.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.personsService.deletePerson(person).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadPersons(),
        });
      }
    });
  }
}
