import { Button } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarProps,
} from '@mui/x-data-grid';
import Link from 'next/link';

const TableToolbar = (props: GridToolbarProps) => {
  return (
    <GridToolbarContainer sx={{ width: '100%' }} {...props}>
      <Link href={props.href} key={props.href}>
        <Button
          startIcon={props.icon}
          variant="text"
          color="primary"
          fullWidth
          size="small"
        >
          {props.label}
        </Button>
      </Link>
      <GridToolbarExport
        printOptions={{
          disableToolbarButton: true,
        }}
        slotProps={{
          button: {
            color: 'primary',
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
