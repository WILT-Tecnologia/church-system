import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalAction } from 'app/components/modal/modal.component';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Suppliers } from 'app/model/Suppliers';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { SupplierFormComponent } from './supplier-form/supplier-form.component';
import { SuppliersService } from './suppliers.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
  imports: [CrudComponent],
})
export class SuppliersComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly writeChurchFornecedores = this.authService.hasPermission(
    'write_church_fornecedores',
  );
  private readonly deleteChurchFornecedores = this.authService.hasPermission(
    'delete_church_fornecedores',
  );
  public readonly suppliers = signal<Suppliers[]>([]);
  public readonly dataSourceMat = new MatTableDataSource<Suppliers>();
  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'cpf_cnpj', header: 'CPF/CNPJ', type: 'cpfCnpj' },
    { key: 'type_supplier', header: 'Tipo do Fornecedor', type: 'typeSupplier' },
    { key: 'type_service', header: 'Tipo de Serviço', type: 'typeService' },
    { key: 'phone_one', header: 'Telefone', type: 'phone' },
    { key: 'email', header: 'Email', type: 'email' },
    { key: 'contact_name', header: 'Contato', type: 'string' },
  ];
  public readonly actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (suppliers: Suppliers) => this.onUpdatedStatus(suppliers),
      visible: () => this.writeChurchFornecedores,
    },
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'inherit',
      action: (suppliers: Suppliers) => this.onEdit(suppliers),
      visible: () => this.writeChurchFornecedores,
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (suppliers: Suppliers) => this.onDelete(suppliers),
      visible: () => this.deleteChurchFornecedores,
    },
  ];

  ngOnInit() {
    this.getAllSuppliers();
  }

  private getAllSuppliers() {
    this.suppliersService.findAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers.set(suppliers);
        this.dataSourceMat.data = this.suppliers();
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Salvar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.dialogService.openModal(
      `modal-${Math.random()}`,
      SupplierFormComponent,
      'Adicionando novo fornecedor',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: Suppliers) => {
      if (result) {
        this.suppliersService.createSuppliers(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.getAllSuppliers(),
        });
      }
    });
  }

  private onEdit(suppliers: Suppliers) {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Atualizar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.dialogService.openModal(
      `modal-${Math.random()}`,
      SupplierFormComponent,
      `Editando o fornecedor ${suppliers.name}`,
      true,
      true,
      { suppliers, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: Suppliers) => {
      if (result) {
        this.suppliersService.updateSuppliers(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.getAllSuppliers(),
        });
      }
    });
  }

  private onDelete(suppliers: Suppliers) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o fornecedor: ${suppliers.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.suppliersService.deleteSuppliers(suppliers).subscribe({
          next: () => {
            this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.getAllSuppliers();
          },
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadingService.hide(),
        });
      }
    });
  }

  private onUpdatedStatus(suppliers: Suppliers) {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja ${suppliers.status ? 'desativar' : 'ativar'} o fornecedor: ${suppliers.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.suppliersService.updatedStatus(suppliers).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.getAllSuppliers(),
        });
      }
    });
  }
}
