export interface Patrimonies {
  id?: string;
  church_id: string;
  number: string;
  name: string;
  registration_date: string;
  description: string;
  type_entry: TypeEntry;
  price?: string | number | null;
  is_member: boolean;
  member_id: string;
  donor?: string | null;
  photo?: File | string | null;
  remove_photo?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export enum TypeEntry {
  Compra = 'C',
  Doação = 'D',
  Transferência = 'T',
}
