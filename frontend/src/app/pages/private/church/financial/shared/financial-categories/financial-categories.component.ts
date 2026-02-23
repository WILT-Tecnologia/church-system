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
import { FinancialCategories } from 'app/model/FinancialCategories';
import { AuthService } from 'app/services/auth/auth.service';
import { FinancialCategoriesService } from './financial-categories.service';
import { FinancialCategoriesFormComponent } from './shared/financial-categories-form/financial-categories-form.component';

@Component({
  selector: 'app-financial-categories',
  templateUrl: './financial-categories.component.html',
  styleUrl: './financial-categories.component.scss',
  imports: [CrudComponent, NotFoundRegisterComponent],
})
export class FinancialCategoriesComponent implements OnInit {
  private readonly financialCategoriesService = inject(FinancialCategoriesService);
  private authService = inject(AuthService);
  private readonly dialog = inject(ModalService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly loading = inject(LoadingService);

  public financialCategories: FinancialCategories[] = [];
  public dataSourceMat = new MatTableDataSource<FinancialCategories>(this.financialCategories);
  public columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última atualização', type: 'datetime' },
  ];
  public actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (financialCategories: FinancialCategories) => this.updatedStatus(financialCategories),
      visible: () => this.authService.hasPermission('write_church_categorias_financeiras'),
    },
    {
      type: 'edit',
      label: 'Editar',
      icon: 'edit',
      color: 'inherit',
      action: (financialCategories: FinancialCategories) => this.editFinancialCategories(financialCategories),
      visible: () => this.authService.hasPermission('write_church_categorias_financeiras'),
    },
    {
      type: 'delete',
      label: 'Excluir',
      icon: 'delete',
      color: 'warn',
      action: (financialCategories: FinancialCategories) => this.deleteFinancialCategories(financialCategories),
      visible: () => this.authService.hasPermission('delete_church_categorias_financeiras'),
    },
  ];

  ngOnInit(): void {
    this.findAllFinancialCategories();
  }

  private findAllFinancialCategories(): void {
    this.loading.show();
    this.financialCategoriesService.findAllFinancialCategories().subscribe({
      next: (financialCategories: FinancialCategories[]) => {
        this.financialCategories = financialCategories;
        this.dataSourceMat.data = this.financialCategories;
        this.loading.hide();
      },
      error: (error) => {
        this.toast.openError(error.error.message ?? MESSAGES.LOADING_ERROR);
        this.loading.hide();
      },
    });
  }

  createFinancialCategories(): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialCategoriesFormComponent,
      'Adicionar categoria',
      true,
      true,
      {},
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllFinancialCategories();
      }
    });
  }

  private editFinancialCategories(financialCategories: FinancialCategories): void {
    const dialogRef = this.dialog.openModal(
      `modal-${Math.random()}`,
      FinancialCategoriesFormComponent,
      `Editando a categoria ${financialCategories.name}`,
      true,
      true,
      { financialCategories },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findAllFinancialCategories();
      }
    });
  }

  private deleteFinancialCategories(financialCategories: FinancialCategories): void {
    const confirm = this.confirmService.openConfirm(
      'Excluir categoria',
      `Tem certeza que deseja excluir a categoria ${financialCategories.name}?`,
      'Excluir',
      'Cancelar',
    );

    confirm.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.financialCategoriesService.deleteFinancialCategories(financialCategories).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.loading.hide();
          },
          error: (error) => {
            this.toast.openError(error.error.message ?? MESSAGES.DELETE_ERROR);
            this.loading.hide();
          },
        });
      }
    });
  }

  private updatedStatus(financialCategories: FinancialCategories): void {
    this.loading.show();
    this.financialCategoriesService.updatedStatus(financialCategories.id, !financialCategories.status).subscribe({
      next: () => {
        this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
        this.loading.hide();
      },
      error: (error) => {
        this.toast.openError(error.error.message ?? MESSAGES.UPDATE_ERROR);
        this.loading.hide();
      },
      complete: () => this.findAllFinancialCategories(),
    });
  }
}
