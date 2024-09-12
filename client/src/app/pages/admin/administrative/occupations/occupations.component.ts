import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Occupation } from '../../../../model/Occupation';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
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
    private router: Router,
    private occupationsService: OccupationsService,
    private snackbarService: SnackbarService
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
    this.router.navigate(['administrative/occupations/occupation/new']);
  };

  editOccupation = (occupation: Occupation): void => {
    this.router.navigate([
      'administrative/occupations/occupation/edit',
      occupation.id,
    ]);
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
