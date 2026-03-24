import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Church } from 'app/model/Church';
import { AuthService } from 'app/services/auth/auth.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ChurchComponent } from './church/church.component';
import { ChurchesService } from './churches.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churches.component.html',
  styleUrls: ['./churches.component.scss'],
  imports: [CrudComponent],
})
export class ChurchesComponent implements OnInit {
  private authService = inject(AuthService);
  private churchsService = inject(ChurchesService);
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private notification = inject(NotificationService);

  churchs = signal<Church[]>([]);
  dataSourceMat = new MatTableDataSource<Church>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'cnpj', header: 'CNPJ', type: 'cnpj' },
    { key: 'responsible.name', header: 'Responsável', type: 'string' },
    { key: 'members_count', header: 'Quantidade de Membros', type: 'number' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (church: Church) => this.onEdit(church),
      visible: () => this.authService.hasPermission('write_administrative_igrejas'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (church: Church) => this.onDelete(church),
      visible: () => this.authService.hasPermission('delete_administrative_igrejas'),
    },
  ];

  ngOnInit() {
    this.loadChurch();
  }

  private loadChurch() {
    this.loading.show();
    this.churchsService.getChurches().subscribe({
      next: (churchsResp) => {
        this.churchs.set(churchsResp);
        this.dataSourceMat.data = churchsResp;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate() {
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
  }

  private onEdit(church: Church) {
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
  }

  private onDelete(church: Church) {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir a igreja ${church.name}?`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.churchsService.deleteChurch(church).subscribe({
          next: () => this.notification.onSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.notification.onError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadChurch(),
        });
      }
    });
  }
}
