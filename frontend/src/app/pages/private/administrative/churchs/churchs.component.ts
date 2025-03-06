import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { FormatsPipe } from 'app/pipes/formats.pipe';
import { NotificationService } from 'app/services/notification/notification.service';
import { ChurchComponent } from './church/church.component';
import { ChurchsService } from './churchs.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churchs.component.html',
  styleUrls: ['./churchs.component.scss'],
  imports: [NotFoundRegisterComponent, CrudComponent, CommonModule],
  providers: [FormatsPipe],
})
export class ChurchsComponent implements OnInit {
  churchs: Church[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Church>(this.churchs);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (church: Church) => this.handleEdit(church),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      action: (church: Church) => this.handleDelete(church),
    },
  ];

  columnDefinitions = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'cnpj', header: 'CNPJ', type: 'cnpj' },
    { key: 'responsible.name', header: 'Responsável', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private churchsService: ChurchsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
    private notification: NotificationService,
  ) {}

  ngOnInit() {
    this.loadChurch();
  }

  loadChurch = () => {
    this.loading.show();
    this.churchsService.getChurch().subscribe({
      next: (churchs) => {
        this.churchs = churchs;
        this.dataSourceMat.data = this.churchs;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  handleCreate = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Adicionando uma igreja',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  handleEdit = (church: Church) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      `Editando a igreja: ${church.name}`,
      true,
      true,
      { church },
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  handleDelete = (church: Church) => {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir a igreja: ${church.name}?`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.churchsService.deleteChurch(church).subscribe({
          next: () => {
            this.notification.onSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.notification.onError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadChurch();
            this.loading.hide();
          },
        });
      }
    });
  };
}
