import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Modules } from 'app/model/Modules';

import { ModuleFormComponent } from './module-form/module-form.component';
import { ModuleService } from './modules.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
  imports: [NotFoundRegisterComponent, CrudComponent],
})
export class ModulesComponent implements OnInit {
  constructor(
    private modal: ModalService,
    private confirmModal: ConfirmService,
    private toast: ToastService,
    private loading: LoadingService,
    private moduleService: ModuleService,
  ) {}

  modules: Modules[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Modules>(this.modules);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (module: Modules) => this.handleEdit(module),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (module: Modules) => this.handleDelete(module),
    },
  ];

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.moduleService.getAll().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.dataSourceMat.data = this.modules;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      ModuleFormComponent,
      'Adicionando um novo módulo',
      true,
      true,
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadModules();
      }
    });
  }

  handleEdit = (module: Modules) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      ModuleFormComponent,
      `Você está editando o módulo: ${module.name}`,
      true,
      true,
      { module },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadModules();
      }
    });
  };

  handleDelete(module: Modules) {
    const modal = this.confirmModal.openConfirm(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o módulo ${module.name}?`,
      'Excluir',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Modules) => {
      if (result) {
        this.moduleService.delete(module.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadModules();
            this.loading.hide();
          },
        });
      }
    });
  }
}
