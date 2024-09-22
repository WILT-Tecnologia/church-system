import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Occupation } from '../../../../model/Occupation';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
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
    TableComponent,
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
    private snackbarService: SnackbarService,
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
    this.occupationsService.deleteOccupation(occupation.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Ocupação excluída com sucesso!');
        this.loadOccupations();
      },
      error: () => {
        this.snackbarService.openError('Erro ao excluir a ocupação!');
      },
    });
  };
}
