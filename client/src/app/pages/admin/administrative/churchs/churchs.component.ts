import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { ToastService } from 'app/components/toast/toast.service';
import { MESSAGES } from 'app/utils/messages';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { Church } from '../../../../model/Church';
import { ChurchComponent } from './church/church.component';
import { ChurchsService } from './churchs.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churchs.component.html',
  styleUrls: ['./churchs.component.scss'],
  standalone: true,
  imports: [NotFoundRegisterComponent, CrudComponent, CommonModule],
})
export class ChurchsComponent implements OnInit {
  churchs: Church[] = [];
  rendeing: boolean = true;
  dataSourceMat = new MatTableDataSource<Church>(this.churchs);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'responsible.name', header: 'Responsável', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'cnpj', header: 'CNPJ', type: 'cnpj' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];

  constructor(
    private churchsService: ChurchsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
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
        this.rendeing = false;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewChurch = () => {
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

  editChurch = (church: Church) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      `Editando a igreja ${church.name}`,
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

  deleteChurch = (church: Church) => {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o registro ${church.name}?`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.churchsService.deleteChurch(church.id).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
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
