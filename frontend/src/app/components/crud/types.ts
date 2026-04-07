export type ActionsProps = {
  type: 'edit' | 'delete' | 'toggle' | string;
  tooltip?: string;
  icon?: string;
  label?: string;
  color?: 'primary' | 'accent' | 'warn' | 'inherit';
  inactiveLabel?: string;
  activeLabel?: string;
  action: (element: any) => void;
  visible?: (element: any) => boolean;
  disabled?: (element: any) => boolean;
};

export type ColumnDefinitionsProps = {
  key: string;
  header: string;
  type:
    | 'string'
    | 'number'
    | 'email'
    | 'phone'
    | 'select'
    | 'url'
    | 'boolean'
    | 'time'
    | 'date'
    | 'datetime'
    | 'color'
    | 'cpfCnpj'
    | 'cpf'
    | 'cnpj'
    | 'YesNo'
    | 'situation'
    | 'typeEntry'
    | 'sex'
    | 'currency'
    | 'typePayment'
    | 'costCenter'
    | 'customerSupplier'
    | 'entryExit'
    | 'typeService'
    | 'typeSupplier';
};
