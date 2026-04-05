import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalAction } from 'app/components/modal/modal.component';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Occupation } from 'app/model/Occupation';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { OccupationComponent } from './occupation/occupation.component';
import { OccupationsService } from './occupations.service';

@Component({
  selector: 'app-occupations',
  templateUrl: './occupations.component.html',
  styleUrls: ['./occupations.component.scss'],
  imports: [CrudComponent],
})
export class OccupationsComponent implements OnInit {
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modalService = inject(ModalService);
  private occupationsService = inject(OccupationsService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_cargos_ministeriais');
  private deletePermission = this.authService.hasPermission('delete_administrative_cargos_ministeriais');

  occupations = signal<Occupation[]>([]);
  dataSourceMat = new MatTableDataSource<Occupation>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (occupation: Occupation) => this.onChangeStatus(occupation),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (occupation: Occupation) => this.onEdit(occupation),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (occupation: Occupation) => this.onDelete(occupation),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadOccupations();
  }

  loadOccupations() {
    this.occupationsService.getOccupations().subscribe({
      next: (occupationsResp) => {
        this.occupations.set(occupationsResp);
        this.dataSourceMat.data = occupationsResp;
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
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
      OccupationComponent,
      'Adicionando um cargo ministerial',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((newOccupation: Occupation) => {
      if (newOccupation) {
        this.occupationsService.createOccupation(newOccupation).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadOccupations(),
        });
      }
    });
  }

  onEdit(occupation: Occupation) {
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
      OccupationComponent,
      `Editando o cargo ministerial: ${occupation.name}`,
      true,
      true,
      { occupation, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((updatedOccupation: Occupation) => {
      if (updatedOccupation) {
        this.occupationsService.updateOccupation(updatedOccupation).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadOccupations(),
        });
      }
    });
  }

  onDelete(occupation: Occupation) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir este cargo ministerial: ${occupation.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Occupation) => {
      if (result) {
        this.occupationsService.deleteOccupation(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadOccupations(),
        });
      }
    });
  }
  onChangeStatus(occupation: Occupation) {
    const updatedStatus = !occupation.status;
    occupation.status = updatedStatus;

    this.occupationsService.updateStatus(occupation).subscribe({
      next: () => {
        this.toastService.openSuccess(
          `Cargo ministerial '${occupation.name.toUpperCase()}' ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
        );
      },
      error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadOccupations(),
    });
  }
}
