import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Modules } from 'app/model/Modules';
import { AuthService } from 'app/services/auth/auth.service';
import { ModuleFormComponent } from './module-form/module-form.component';
import { ModuleService } from './modules.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.scss',
  imports: [CrudComponent],
})
export class ModulesComponent implements OnInit {
  private modal = inject(ModalService);
  private confirmModal = inject(ConfirmService);
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private moduleService = inject(ModuleService);
  private authService = inject(AuthService);

  modules = signal<Modules[]>([]);
  rendering = signal(true);
  dataSourceMat = new MatTableDataSource<Modules>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Módulo', type: 'string' },
    { key: 'context', header: 'Grupo', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (module: Modules) => this.onEdit(module),
      visible: () => this.authService.hasPermission('write_administrative_modulos'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (module: Modules) => this.onDelete(module),
      visible: () => this.authService.hasPermission('delete_administrative_modulos'),
    },
  ];

  ngOnInit() {
    this.loadModules();
  }

  private loadModules() {
    this.loading.show();
    this.moduleService.findAll().subscribe({
      next: (modulesResp) => {
        const mapped = modulesResp.map((module) => ({
          ...module,
          context: this.formatContext(module.context),
        }));
        this.modules.set(mapped);
        this.dataSourceMat.data = mapped;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  }

  private formatContext(context: string): string {
    const contextMap: { [key: string]: string } = {
      church: 'Igreja',
      administrative: 'Administrativo',
    };
    return contextMap[context] || context;
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

  onEdit(module: Modules) {
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
  }

  onDelete(module: Modules) {
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
