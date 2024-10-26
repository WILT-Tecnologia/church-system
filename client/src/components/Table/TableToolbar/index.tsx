import { Button } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarProps,
} from '@mui/x-data-grid';
import Link from 'next/link';

interface TableToolbarProps extends GridToolbarProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const TableToolbar = (props: TableToolbarProps) => {
  return (
    <GridToolbarContainer
      className="flex lg:flex-row md:flex-col m-2 items-center"
      {...props}
    >
      {props.href && (
        <Link href={props.href} key={props.href}>
          <Button
            startIcon={props.icon}
            variant="text"
            color="primary"
            size="large"
          >
            {props.label}
          </Button>
        </Link>
      )}

      {!props.href && (
        <Button
          startIcon={props.icon}
          variant="contained"
          color="primary"
          size="medium"
          onClick={props.onClick}
        >
          {props.label}
        </Button>
      )}

      <GridToolbarExport
        printOptions={{
          disableToolbarButton: true,
        }}
        slotProps={{
          button: {
            color: 'primary',
            size: 'medium',
            variant: 'outlined',
            label: 'Exportar',
          },
          tooltip: {
            title: 'Exportar',
          },
        }}
      />
    </GridToolbarContainer>
  );
};

export default TableToolbar;
