import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { Occupation } from '../../../../model/Occupation';
import { OccupationComponent } from './occupation/occupation.component';
import { OccupationsService } from './occupations.service';

@Component({
  selector: 'app-occupations',
  templateUrl: './occupations.component.html',
  styleUrls: ['./occupations.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class OccupationsComponent implements OnInit {
  occupations: Occupation[] = [];
  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    description: 'Descrição',
    status: 'Situação',
    actions: 'Ações',
  };

  constructor(
    private occupationsService: OccupationsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmeService: ConfirmService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadOccupations();
  }

  loadOccupations = () => {
    this.occupationsService.getOccupations().subscribe((occupations) => {
      this.occupations = occupations;
    });
  };

  addNewOccupation = (): void => {
    const dialogRef = this.dialog.open(OccupationComponent, {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((newOccupation) => {
      if (newOccupation) {
        this.loadOccupations();
      }
    });
  };

  editOccupation = (occupation: Occupation): void => {
    const dialogRef = this.dialog.open(OccupationComponent, {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: { occupation },
    });

    dialogRef.afterClosed().subscribe((updatedOccupation) => {
      if (updatedOccupation) {
        this.loadOccupations();
      }
    });
  };

  deleteOccupation = (occupation: Occupation): void => {
    this.confirmeService
      .openConfirm(
        'Atenção',
        `Tem certeza que deseja excluir esta ocupação: ${occupation.name}?`,
        'Sim',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loading.show();
          this.occupationsService.deleteOccupation(occupation.id).subscribe({
            next: () => {
              this.toast.openSuccess('Ocupação excluída com sucesso!');
              this.loadOccupations();
            },
            error: () => {
              this.loading.hide();
              this.toast.openError('Erro ao excluir a ocupação!');
            },
            complete: () => {
              this.loading.hide();
            },
          });
        }
      });
  };
}
