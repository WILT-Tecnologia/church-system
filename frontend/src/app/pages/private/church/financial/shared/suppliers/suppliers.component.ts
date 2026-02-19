import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

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
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);

  public suppliers: Suppliers[] = [];
  public dataSourceMat = new MatTableDataSource<Suppliers>();
  public columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'type', header: 'Tipo', type: 'string' },
    { key: 'document', header: 'Documento', type: 'string' },
    { key: 'phone_one', header: 'Telefone', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
  ];
  public actions: ActionsProps[] = [
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      action: (suppliers: Suppliers) => this.editSuppliers(suppliers),
      visible: () => this.authService.hasPermission('write_church_financial_suppliers'),
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      action: (suppliers: Suppliers) => this.deleteSuppliers(suppliers),
      visible: () => this.authService.hasPermission('delete_church_financial_suppliers'),
    },
  ];

  ngOnInit(): void {
    this.findAllSuppliers();
  }

  private findAllSuppliers(): void {
    this.suppliersService.findAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.dataSourceMat.data = data;
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
}
