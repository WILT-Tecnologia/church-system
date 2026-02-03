import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

import { FinancialCategoriesComponent } from './shared/financial-categories/financial-categories.component';
import { FinancialTransactionsComponent } from './shared/financial-transactions/financial-transactions.component';
import { PatrimoniesComponent } from './shared/patrimonies/patrimonies.component';
import { SuppliersComponent } from './shared/suppliers/suppliers.component';

@Component({
  selector: 'app-financial',
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.scss',
  imports: [
    PatrimoniesComponent,
    MatTabGroup,
    MatTab,
    SuppliersComponent,
    FinancialCategoriesComponent,
    FinancialTransactionsComponent,
  ],
})
export class FinancialComponent {}
