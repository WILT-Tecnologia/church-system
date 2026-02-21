import { Church } from './Church';

export interface Suppliers {
  id: string;
  church_id: string;
  church: Church;
  name: string;
  type_supplier: TypeSupplier;
  cpf_cnpj: string;
  type_service: TypeService;
  pix_key?: string;
  status: boolean;
  cep?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  uf?: string;
  country?: string;
  phone_one?: string;
  phone_two?: string;
  phone_three?: string;
  email?: string;
  contact_name?: string;
  obs?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export enum TypeSupplier {
  PF = 'PF',
  PJ = 'PJ',
}

export enum TypeService {
  PRODUTO = 'Produto',
  SERVICO = 'Serviço',
  AMBOS = 'Ambos',
}
