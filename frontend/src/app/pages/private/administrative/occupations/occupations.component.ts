import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '../../../../components/confirm/confirm.service';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../components/crud/crud.component';
import { LoadingService } from '../../../../components/loading/loading.service';
import { ModalService } from '../../../../components/modal/modal.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { MESSAGES } from '../../../../components/toast/messages';
import { ToastService } from '../../../../components/toast/toast.service';
import { Occupation } from '../../../../model/Occupation';
import { OccupationComponent } from './occupation/occupation.component';
import { OccupationsService } from './occupations.service';

@Component({
    selector: 'app-occupations',
    templateUrl: './occupations.component.html',
    styleUrls: ['./occupations.component.scss'],
    imports: [NotFoundRegisterComponent, CommonModule, CrudComponent]
})
export class OccupationsComponent implements OnInit {
  occupations: Occupation[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Occupation>(this.occupations);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'toggle',
      tooltip: 'Ativa/Desativa a ocupação',
      icon: 'toggle_on',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (occupation: Occupation) => this.toggleStatus(occupation),
    },
    {
      type: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      label: 'Editar',
      action: (occupation: Occupation) => this.handleEdit(occupation),
    },
    {
      type: 'delete',
      tooltip: 'Excluir',
      icon: 'delete',
      label: 'Excluir',
      action: (occupation: Occupation) => this.handleDelete(occupation),
    },
  ];

  columnDefinitions = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private toast: ToastService,
    private loading: LoadingService,
    private confirmeService: ConfirmService,
    private modal: ModalService,
    private occupationsService: OccupationsService,
  ) {}

  ngOnInit() {
    this.loadOccupations();
  }

  loadOccupations = () => {
    this.occupationsService.getOccupations().subscribe({
      next: (occupations) => {
        this.occupations = occupations;
        this.dataSourceMat.data = this.occupations;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => {
        this.loading.hide();
      },
    });
  };

  handleCreate = () => {
    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      'Adicionando ocupação',
      true,
      true,
    );

    dialogRef.afterClosed().subscribe((newOccupation: Occupation) => {
      if (newOccupation) {
        this.loadOccupations();
      }
    });
  };

  handleEdit = (occupation: Occupation) => {
    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      OccupationComponent,
      'Editando ocupação',
      true,
      true,
      { occupation },
    );

    dialogRef.afterClosed().subscribe((updatedOccupation: Occupation) => {
      if (updatedOccupation) {
        this.loadOccupations();
      }
    });
  };

  handleDelete = (occupation: Occupation) => {
    const modal = this.confirmeService.openConfirm(
      'Atenção',
      `Tem certeza que deseja excluir esta ocupação: ${occupation.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.occupationsService.deleteOccupation(occupation.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadOccupations();
            this.loading.hide();
          },
        });
      }
    });
  };
  toggleStatus = (occupation: Occupation) => {
    const updatedStatus = !occupation.status;
    occupation.status = updatedStatus;

    this.occupationsService
      .updatedStatus(occupation.id, updatedStatus)
      .subscribe({
        next: () => {
          this.toast.openSuccess(
            `Ocupação ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
          );
        },
        error: () => {
          this.loading.hide();
          this.toast.openError(MESSAGES.UPDATE_ERROR);
        },
        complete: () => {
          this.loadOccupations();
          this.loading.hide();
        },
      });
  };
}
