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
import { CustomerSupplier, EntryExit, FinancialTransations, Payment } from 'app/model/FinancialTransations';
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
    { key: 'category.name', header: 'Categoria', type: 'string' },
    { key: 'customer_supplier_label', header: 'Tipo', type: 'string' },
    { key: 'person_supplier_name', header: 'Pessoa/Fornecedor', type: 'string' },
    { key: 'entry_exit_label', header: 'Tipo', type: 'string' },
    { key: 'payment_label', header: 'Forma de Pagamento', type: 'string' },
    { key: 'amount', header: 'Valor Original', type: 'currency' },
    { key: 'discount', header: 'Valor do Desconto', type: 'currency' },
    { key: 'amount_discount', header: 'Valor com Desconto', type: 'currency' },
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
    this.findAllFinancialTransactions();
  }

  private findAllFinancialTransactions(): void {
    this.financialTransactionsService.findAllFinancialTransactions().subscribe({
      next: (data) => {
        this.financialTransactions = data.map((ft) => {
          return {
            ...ft,
            payment_label:
              ft.payment === Payment.PIX
                ? 'PIX'
                : ft.payment === Payment.DINHEIRO
                  ? 'Dinheiro'
                  : ft.payment === Payment.BOLETO
                    ? 'Boleto'
                    : ft.payment === Payment.CREDITO
                      ? 'Crédito'
                      : ft.payment === Payment.DEBITO
                        ? 'Débito'
                        : ft.payment === Payment.CHEQUE
                          ? 'Cheque'
                          : '',
            entry_exit_label: ft.entry_exit === EntryExit.ENTRADA ? 'Entrada' : 'Saída',
            person_supplier_name: ft.supplier?.name || ft.member?.person?.name || ft.person_name || '',
            customer_supplier_label:
              ft.customer_supplier === CustomerSupplier.MEMBRO
                ? 'Membro'
                : ft.customer_supplier === CustomerSupplier.FORNECEDOR
                  ? 'Fornecedor'
                  : 'Pessoa',
          } as unknown as FinancialTransations;
        });
        this.dataSourceMat.data = this.financialTransactions;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  createFinancialTransactions(): void {
    const modal = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      'Adicionar Lançamento',
      true,
      true,
      {},
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllFinancialTransactions();
      }
    });
  }

  editFinancialTransactions(financialTransactions: FinancialTransations): void {
    const modal = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      `Editando o Lançamento`,
      true,
      true,
      { financialTransactions },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllFinancialTransactions();
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
            this.findAllFinancialTransactions();
          },
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loading.hide(),
        });
      }
    });
  }
}
