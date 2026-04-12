import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { FinancialCategories } from '@app/model/FinancialCategories';
import { AuthService } from '@app/services/auth/auth.service';
import { FormService } from '@app/services/form-service.service';
import { FinancialCategoriesService } from './financial-categories.service';
import { FinancialCategoriesFormComponent } from './shared/financial-categories-form/financial-categories-form.component';

@Component({
  selector: 'app-financial-categories',
  templateUrl: './financial-categories.component.html',
  styleUrl: './financial-categories.component.scss',
  imports: [CrudComponent],
})
export class FinancialCategoriesComponent implements OnInit {
  private readonly financialCategoriesService = inject(FinancialCategoriesService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly formService = inject(FormService);
  readonly writePermission = signal<string>('write_church_categorias_financeiras');
  readonly deletePermission = signal<string>('delete_church_categorias_financeiras');
  private readonly writeChurchCategoriesFinancial = this.authService.hasPermission(
    this.writePermission(),
  );
  private readonly deleteChurchCategoriesFinancial = this.authService.hasPermission(
    this.deletePermission(),
  );

  public readonly financialCategories = signal<FinancialCategories[]>([]);
  public readonly dataSourceMat = new MatTableDataSource<FinancialCategories>(
    this.financialCategories(),
  );
  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'created_at', header: 'Data de criação', type: 'datetime' },
    { key: 'updated_at', header: 'Última atualização', type: 'datetime' },
  ];
  public readonly actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (financialCategories: FinancialCategories) => this.updatedStatus(financialCategories),
      visible: () => this.writeChurchCategoriesFinancial,
    },
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'inherit',
      action: (financialCategories: FinancialCategories) =>
        this.editFinancialCategories(financialCategories),
      visible: () => this.writeChurchCategoriesFinancial,
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (financialCategories: FinancialCategories) =>
        this.deleteFinancialCategories(financialCategories),
      visible: () => this.deleteChurchCategoriesFinancial,
    },
  ];

  ngOnInit(): void {
    this.getAllFinancialCategories();
  }

  private getAllFinancialCategories() {
    this.financialCategoriesService.getAllFinancialCategories().subscribe({
      next: (financialCategories) => {
        this.financialCategories.set(financialCategories);
        this.dataSourceMat.data = this.financialCategories();
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    const modal = this.formService.openFormModal(
      'Adicionar nova categoria de lançamento',
      FinancialCategoriesFormComponent,
      {},
      ['cancel', 'save'],
      false,
    );

    modal.subscribe((result: FinancialCategories) => {
      if (result) {
        this.financialCategoriesService.createFinancialCategories(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.getAllFinancialCategories(),
        });
      }
    });
  }

  private editFinancialCategories(financialCategories: FinancialCategories) {
    const modal = this.formService.openFormModal(
      `Editando a categoria de lançamento "${financialCategories.name.toUpperCase()}"`,
      FinancialCategoriesFormComponent,
      { financialCategories },
      ['cancel', 'save'],
      false,
    );

    modal.subscribe((result: FinancialCategories) => {
      if (result) {
        this.financialCategoriesService.updateFinancialCategories(result).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.getAllFinancialCategories(),
        });
      }
    });
  }

  private deleteFinancialCategories(financialCategories: FinancialCategories): void {
    const modal = this.confirmService.openConfirm(
      'Exclusão de categoria de lançamento',
      `Tem certeza que deseja excluir a categoria de lançamento "${financialCategories.name.toUpperCase()}"?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.financialCategoriesService.deleteFinancialCategories(financialCategories).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.getAllFinancialCategories(),
        });
      }
    });
  }

  private updatedStatus(financialCategories: FinancialCategories): void {
    const modal = this.confirmService.openConfirm(
      'Atualização de status de categoria de lançamento',
      `Tem certeza que deseja ${financialCategories.status ? 'desativar' : 'ativar'} a categoria de lançamento "${financialCategories.name.toUpperCase()}"?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.financialCategoriesService.updatedStatus(financialCategories).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: (error) =>
            this.toastService.openError(error.error.message ?? MESSAGES.UPDATE_ERROR),
          complete: () => this.getAllFinancialCategories(),
        });
      }
    });
  }
}
