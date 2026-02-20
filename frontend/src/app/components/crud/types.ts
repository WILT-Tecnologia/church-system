export type ActionsProps = {
  type: string;
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
  type: string;
};
