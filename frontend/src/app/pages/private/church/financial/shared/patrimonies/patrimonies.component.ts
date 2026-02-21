import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Patrimonies } from 'app/model/Patrimonies';
import { AuthService } from 'app/services/auth/auth.service';
import { PatrimoniesFormComponent } from './patrimonies-form/patrimonies-form.component';
import { PatrimoniesService } from './patrimonies.service';

@Component({
  selector: 'app-patrimonies',
  templateUrl: './patrimonies.component.html',
  styleUrl: './patrimonies.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent, CommonModule],
})
export class PatrimoniesComponent implements OnInit {
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private confirmService = inject(ConfirmService);
  private modal = inject(ModalService);
  private patrimoniesService = inject(PatrimoniesService);
  private authService = inject(AuthService);

  patrimonies: Patrimonies[] = [];
  dataSourceMat = new MatTableDataSource<Patrimonies>(this.patrimonies);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'number', header: 'N° do patrimônio', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'price', header: 'Preço', type: 'currency' },
    { key: 'type_entry', header: 'Tipo de entrada', type: 'typeEntry' },
    { key: 'registration_date', header: 'Data de registro', type: 'date' },
    { key: 'donorOrMember', header: 'Doador', type: 'string' },
    { key: 'is_member', header: 'É Membro?', type: 'YesNo' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      action: (patrimonies: Patrimonies) => this.editPatrimonies(patrimonies),
      visible: () => this.authService.hasPermission('write_church_patrimonios'),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (patrimonies: Patrimonies) => this.deletePatrimonies(patrimonies),
      visible: () => this.authService.hasPermission('delete_church_patrimonios'),
    },
  ];

  ngOnInit() {
    this.loadPatrimonies();
  }

  loadPatrimonies() {
    this.patrimoniesService.findAll().subscribe({
      next: (data) => {
        this.patrimonies = data.map((patrimonies) => ({
          donorOrMember: patrimonies.donor ? patrimonies.donor : (patrimonies.member?.person?.name ?? '--'),
          ...patrimonies,
        }));
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  createPatrimonies() {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      PatrimoniesFormComponent,
      'Adicionar convidado',
      true,
      true,
      {},
    );

    modal.afterClosed().subscribe((data) => {
      if (data) {
        this.loadPatrimonies();
      }
    });
  }

  editPatrimonies(patrimonies: Patrimonies) {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      PatrimoniesFormComponent,
      `Editando o patrimonio ${patrimonies.number} - ${patrimonies.name}`,
      true,
      true,
      { patrimonies },
    );

    modal.afterClosed().subscribe((data) => {
      if (data) {
        this.loadPatrimonies();
      }
    });
  }

  deletePatrimonies(patrimonies: Patrimonies) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      'Tem certeza que deseja excluir este patrimônio?',
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.patrimoniesService.deletePatrimonies(patrimonies).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => {
            this.loadPatrimonies();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
        });
      }
    });
  }
}
