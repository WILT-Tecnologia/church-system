import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Suppliers } from 'app/model/Suppliers';
import { AuthService } from 'app/services/auth/auth.service';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { SuppliersService } from './suppliers.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent, CommonModule],
})
export class SuppliersComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private authService = inject(AuthService);
  private readonly dialog = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);

  public suppliers: Suppliers[] = [];
  public dataSourceMat = new MatTableDataSource<Suppliers>();
  public columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'cpf_cnpj', header: 'CPF/CNPJ', type: 'cpfCnpj' },
    { key: 'type_supplier', header: 'Tipo do Fornecedor', type: 'typeSupplier' },
    { key: 'type_service', header: 'Tipo de Serviço', type: 'string' },
    { key: 'phone_one', header: 'Telefone', type: 'phone' },
    { key: 'email', header: 'Email', type: 'email' },
    { key: 'contact_name', header: 'Contato', type: 'string' },
  ];
  public actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (suppliers: Suppliers) => this.updatedStatus(suppliers),
      visible: () => this.authService.hasPermission('write_church_fornecedores'),
    },
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'inherit',
      action: (suppliers: Suppliers) => this.editSuppliers(suppliers),
      visible: () => this.authService.hasPermission('write_church_fornecedores'),
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (suppliers: Suppliers) => this.deleteSuppliers(suppliers),
      visible: () => this.authService.hasPermission('delete_church_fornecedores'),
    },
  ];

  ngOnInit(): void {
    this.findAllSuppliers();
  }

  private findAllSuppliers(): void {
    this.suppliersService.findAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.dataSourceMat.data = this.suppliers;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  createSuppliers(): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      SupplierFormComponent,
      'Adicionar fornecedor',
      true,
      true,
      {},
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllSuppliers();
      }
    });
  }

  editSuppliers(suppliers: Suppliers): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      SupplierFormComponent,
      `Editando o fornecedor ${suppliers.name}`,
      true,
      true,
      { suppliers },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllSuppliers();
      }
    });
  }

  deleteSuppliers(suppliers: Suppliers): void {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o fornecedor: ${suppliers.name}?`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.suppliersService.deleteSuppliers(suppliers).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.findAllSuppliers();
          },
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loading.hide(),
        });
      }
    });
  }

  updatedStatus(suppliers: Suppliers) {
    this.suppliersService.updatedStatus(suppliers.id, !suppliers.status).subscribe({
      next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.findAllSuppliers(),
    });
  }
}
