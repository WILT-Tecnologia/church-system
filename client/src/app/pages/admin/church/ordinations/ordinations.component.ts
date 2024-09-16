import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TableComponent } from 'app/components/table/table.component';
import { Ordination } from 'app/model/Ordination';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { OrdinationsService } from './ordinations.service';

@Component({
  selector: 'app-ordinations',
  templateUrl: './ordinations.component.html',
  styleUrls: ['./ordinations.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    TableComponent,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class OrdinationsComponent implements OnInit {
  ordination: Ordination[] = [];
  displayedColumns: string[] = [
    'member_id',
    'occupation_id',
    'initial_date',
    'end_date',
    'status',
    'actions',
  ];

  columnDefinitions = {
    member_id: 'Membro',
    occupation_id: 'Ocupação',
    initial_date: 'Data Inicial',
    end_date: 'Data Final',
    status: 'Status',
    actions: 'Ações',
  };

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private ordinationService: OrdinationsService
  ) {}

  ngOnInit() {
    this.loadOrdinations();
  }

  loadOrdinations = () => {
    this.loading.show();
    this.ordinationService.getOrdinations().subscribe((ordination) => {
      this.ordination = ordination;
    });
    this.loading.hide();
  };

  addNewOrdination = (): void => {
    this.router.navigate(['church/ordinations/ordination/new']);
  };

  editOrdination = (ordination: Ordination): void => {
    this.router.navigate(['church/ordinations/ordination/edit', ordination.id]);
  };

  deleteOrdination = (ordination: Ordination): void => {
    this.loading.show();
    this.ordinationService.deleteOrdination(ordination.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Ordinação excluída com sucesso!');
        this.loadOrdinations();
      },

      error: () => {
        this.loading.hide();
        this.snackbarService.openError('Erro ao excluir ordinações');
      },

      complete: () => this.loading.hide(),
    });
  };
}
