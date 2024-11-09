import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/service/snackbar/messages';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Church } from '../../../../model/Church';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { ChurchComponent } from './church/church.component';
import { ChurchsService } from './churchs.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churchs.component.html',
  styleUrls: ['./churchs.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    TableComponent,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class ChurchsComponent implements OnInit {
  churchs: Church[] = [];
  displayedColumns: string[] = [
    'responsible',
    'name',
    'email',
    'cnpj',
    'actions',
  ];

  columnDefinitions = {
    responsible: 'Responsável',
    name: 'Nome',
    email: 'Email',
    cnpj: 'CNPJ',
    actions: 'Ações',
  };

  constructor(
    private churchsService: ChurchsService,
    private snackbarService: SnackbarService,
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
      },
      error: () => this.snackbarService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewChurch = (): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Adicionar igreja',
      true,
      [],
      true,
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  editChurch = (church: Church): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Editar igreja',
      true,
      [],
      true,
      { church },
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  deleteChurch = (church: Church): void => {
    this.confirmService
      .openConfirm(
        'Atenção',
        'Você tem certeza que deseja excluir o registro?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.churchsService.deleteChurch(church.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.loadChurch();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError(
                MESSAGES.DELETE_ERROR + ': ' + church.name,
              );
            },
            complete: () => this.loading.hide(),
          });
        }
      });
  };
}
