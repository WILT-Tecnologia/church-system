import { Church } from './Church';
import { FinancialCategories } from './FinancialCategories';
import { Members } from './Members';
import { Suppliers } from './Suppliers';

export interface FinancialTransations {
  id: string;
  church_id: string;
  church?: Church;
  entry_exit: EntryExit;
  customer_supplier: CustomerSupplier;
  member_id: string | null;
  member?: Members | null;
  supplier_id: string | null;
  supplier?: Suppliers | null;
  person_name: string | null;
  description: string | null;
  cat_financial_id: string;
  category_id?: FinancialCategories;
  category?: FinancialCategories;
  payment: Payment;
  amount: number;
  discount?: number;
  amount_discount?: number;
  payment_date: Date | string;
  receipt?: string | File | null;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export enum EntryExit {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export enum CustomerSupplier {
  MEMBRO = 'membro',
  FORNECEDOR = 'fornecedor',
  PESSOA = 'pessoa',
}

export enum Payment {
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
  BOLETO = 'boleto',
  CREDITO = 'credito',
  DEBITO = 'debito',
  CHEQUE = 'cheque',
}
