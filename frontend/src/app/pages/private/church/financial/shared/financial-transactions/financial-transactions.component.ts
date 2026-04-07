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
import { CustomerSupplier, EntryExit, FinancialTransations, Payment } from 'app/model/FinancialTransations';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { FinancialTransactionsService } from './financial-transactions.service';
import { FinancialTransactionsFormComponent } from './shared/financial-transactions-form/financial-transactions-form.component';

@Component({
  selector: 'app-financial-transactions',
  templateUrl: './financial-transactions.component.html',
  styleUrl: './financial-transactions.component.scss',
  imports: [CrudComponent],
})
export class FinancialTransactionsComponent implements OnInit {
  private readonly financialTransactionsService = inject(FinancialTransactionsService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);
  private readonly writePermission = this.authService.hasPermission('write_church_lancamentos_financeiros');
  private readonly deletePermission = this.authService.hasPermission('delete_church_lancamentos_financeiros');

  public financialTransactions = signal<FinancialTransations[]>([]);
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
      action: (financialTransactions: FinancialTransations) => this.onEdit(financialTransactions),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (financialTransactions: FinancialTransations) => this.onDelete(financialTransactions),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit(): void {
    this.loadFinancialTransactions();
  }

  private loadFinancialTransactions(): void {
    this.financialTransactionsService.findAllFinancialTransactions().subscribe({
      next: (data) => {
        const mapped = data.map((ft) => {
          let payment_label = '';
          switch (ft.payment) {
            case Payment.PIX:
              payment_label = 'PIX';
              break;
            case Payment.DINHEIRO:
              payment_label = 'Dinheiro';
              break;
            case Payment.BOLETO:
              payment_label = 'Boleto';
              break;
            case Payment.CREDITO:
              payment_label = 'Crédito';
              break;
            case Payment.DEBITO:
              payment_label = 'Débito';
              break;
            case Payment.CHEQUE:
              payment_label = 'Cheque';
              break;
            default:
              payment_label = '';
              break;
          }

          let entry_exit_label = '';
          switch (ft.entry_exit) {
            case EntryExit.ENTRADA:
              entry_exit_label = 'Entrada';
              break;
            case EntryExit.SAIDA:
              entry_exit_label = 'Saída';
              break;
            default:
              entry_exit_label = '';
              break;
          }

          let person_supplier_name = '';
          switch (ft.customer_supplier) {
            case CustomerSupplier.MEMBRO:
              person_supplier_name = ft.member?.person?.name || '';
              break;
            case CustomerSupplier.FORNECEDOR:
              person_supplier_name = ft.supplier?.name || '';
              break;
            default:
              person_supplier_name = ft.person_name || '';
              break;
          }

          let customer_supplier_label = '';
          switch (ft.customer_supplier) {
            case CustomerSupplier.MEMBRO:
              customer_supplier_label = 'Membro';
              break;
            case CustomerSupplier.FORNECEDOR:
              customer_supplier_label = 'Fornecedor';
              break;
            default:
              customer_supplier_label = 'Pessoa';
              break;
          }

          return {
            ...ft,
            payment_label,
            entry_exit_label,
            person_supplier_name,
            customer_supplier_label,
          } as unknown as FinancialTransations;
        });

        this.financialTransactions.set(mapped);
        this.dataSourceMat.data = mapped;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  onCreate(): void {
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

    const modal = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      'Adicionar Lançamento',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((formData: FormData) => {
      if (formData) {
        this.financialTransactionsService.createWithFormData(formData).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadFinancialTransactions(),
        });
      }
    });
  }

  private onEdit(financialTransactions: FinancialTransations): void {
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

    const modal = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialTransactionsFormComponent,
      `Editando o Lançamento`,
      true,
      true,
      { financialTransactions, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((formData: FormData) => {
      if (formData) {
        this.financialTransactionsService.updateWithFormData(formData).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadFinancialTransactions(),
        });
      }
    });
  }

  private onDelete(financialTransactions: FinancialTransations): void {
    const modal = this.confirmService.openConfirm(
      'Atenção',
      `Você tem certeza que deseja excluir o lançamento?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.financialTransactionsService.deleteFinancialTransactions(financialTransactions).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toast.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadFinancialTransactions(),
        });
      }
    });
  }
}
