import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Church } from '../../../../model/Church';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { ChurchsService } from './churchs.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churchs.component.html',
  styleUrls: ['./churchs.component.scss'],
  standalone: true,
  imports: [
    TableComponent,
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class ChurchsComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private churchsService: ChurchsService,
    private loading: LoadingService
  ) {}

  ngOnInit() {
    this.loadChurch();
  }

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

  loadChurch = () => {
    this.churchsService.getChurch().subscribe((churchs) => {
      this.churchs = churchs;
    });
  };

  addNewChurch = (): void => {
    this.router.navigate(['administrative/churchs/church/new']);
  };

  editChurch = (church: Church): void => {
    this.router.navigate(['administrative/churchs/church/edit', church.id]);
  };

  deleteChurch = (church: Church): void => {
    this.loading.show();
    this.churchsService.deleteChurch(church.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Igreja excluída com sucesso!');
        this.loadChurch();
      },
      error: () => {
        this.loading.hide();
        this.snackbarService.openError(
          'Erro ao excluir a igreja. Tente novamente mais tarde.'
        );
      },
    });
    this.loading.hide();
  };
}
