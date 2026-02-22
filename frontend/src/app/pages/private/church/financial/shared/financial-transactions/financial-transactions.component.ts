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
import { FinancialTransations } from 'app/model/FinancialTransations';
import { AuthService } from 'app/services/auth/auth.service';
import { FinancialTransactionsService } from './financial-transactions.service';
import { FinancialTransactionsFormComponent } from './shared/financial-transactions-form/financial-transactions-form.component';

@Component({
  selector: 'app-financial-transactions',
  templateUrl: './financial-transactions.component.html',
  styleUrl: './financial-transactions.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent, CommonModule],
})
export class FinancialTransactionsComponent implements OnInit {
  private readonly financialTransactionsService = inject(FinancialTransactionsService);
  private authService = inject(AuthService);
  private readonly dialog = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);

  public financialTransactions: FinancialTransations[] = [];
  public dataSourceMat = new MatTableDataSource<FinancialTransations>();
  public columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'category.name', header: 'Nome', type: 'string' },
    { key: 'customer_supplier', header: 'Cliente/Fornecedor', type: 'string' },
    { key: 'supplier.name', header: 'Fornecedor', type: 'string' },
    { key: 'member.name', header: 'Membro', type: 'string' },
    { key: 'entry_exit', header: 'Tipo', type: 'string' },
    { key: 'payment', header: 'Valor', type: 'string' },
    { key: 'person_name', header: 'Pessoa', type: 'string' },
    { key: 'amount', header: 'Valor Original', type: 'currency' },
    { key: 'amount_discount', header: 'Valor com Desconto', type: 'currency' },
    { key: 'discount', header: 'Valor do Desconto', type: 'currency' },
    { key: 'payment_date', header: 'Data de Pagamento', type: 'date' },
  ];
  public actions: ActionsProps[] = [
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'inherit',
      action: (financialTransactions: FinancialTransations) => this.editFinancialTransactions(financialTransactions),
      visible: () => this.authService.hasPermission('write_church_lancamentos_financeiros'),
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (financialTransactions: FinancialTransations) => this.deleteFinancialTransactions(financialTransactions),
      visible: () => this.authService.hasPermission('delete_church_lancamentos_financeiros'),
    },
  ];

  ngOnInit(): void {
    this.findAllSuppliers();
  }

  private findAllSuppliers(): void {
    this.financialTransactionsService.findAllFinancialTransactions().subscribe({
      next: (data) => {
        this.financialTransactions = data;
        this.dataSourceMat.data = this.financialTransactions;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  createFinancialTransactions(): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      'Adicionar Lançamento',
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

  editFinancialTransactions(financialTransactions: FinancialTransations): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      `Editando o Lançamento`,
      true,
      true,
      { financialTransactions },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllSuppliers();
      }
    });
  }

  deleteFinancialTransactions(financialTransactions: FinancialTransations): void {
    const dialogRef = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o lançamento?`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.financialTransactionsService.deleteFinancialTransactions(financialTransactions).subscribe({
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
}
