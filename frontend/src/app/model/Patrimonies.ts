export interface Patrimonies {
  id: string;
  church_id: string;
  number: string;
  name: string;
  registration_date: Date;
  description: string;
  type_entry: TypeEntry;
  price: number;
  is_member: string;
  member_id: boolean;
  donor: string;
  photo: string;
  created_at: Date;
  updated_at: Date;
}

export enum TypeEntry {
  Compra = 'C',
  Doação = 'D',
  Transferência = 'T',
}
