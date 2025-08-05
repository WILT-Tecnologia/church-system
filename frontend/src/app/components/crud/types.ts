export type ActionsProps = {
  type: string;
  tooltip?: string;
  icon?: string;
  label?: string;
  color?: 'primary' | 'accent' | 'warn';
  inactiveLabel?: string;
  activeLabel?: string;
  action: (element: any) => void;
};

export type ColumnDefinitionsProps = {
  key: string;
  header: string;
  type: string;
};
