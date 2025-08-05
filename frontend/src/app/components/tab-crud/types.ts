import { ActionsProps, ColumnDefinitionsProps } from '../crud/types';

export interface TabConfig {
  id: string;
  name: string;
  color?: string;
}

export interface CrudConfig {
  columnDefinitions: ColumnDefinitionsProps[];
  actions: ActionsProps[];
  addFn: () => void;
  editFn: (item: any) => void;
  deleteFn: (item: any) => void;
  toggleFn?: (item: any) => void;
  enableToggleStatus: boolean;
}
