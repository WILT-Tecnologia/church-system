import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
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
    private dialog: MatDialog,
    private confirmService: ConfirmService,
  ) {}

  ngOnInit() {
    this.loadChurch();
  }

  loadChurch = () => {
    this.churchsService.getChurch().subscribe((churchs) => {
      this.churchs = churchs;
    });
  };

  addNewChurch = (): void => {
    const dialogRef = this.dialog.open(ChurchComponent, {
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((newChurch) => {
      if (newChurch) {
        this.loadChurch();
      }
    });
  };

  editChurch = (church: Church): void => {
    const dialogRef = this.dialog.open(ChurchComponent, {
      id: church.id,
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,

      data: { church },
    });

    dialogRef.afterClosed().subscribe((updatedChurch) => {
      if (updatedChurch) {
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
              this.snackbarService.openSuccess('Igreja excluída com sucesso!');
              this.loadChurch();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError(
                'Erro ao excluir a igreja. Tente novamente mais tarde.',
              );
            },
            complete: () => this.loading.hide(),
          });
        }
      });
  };
}
