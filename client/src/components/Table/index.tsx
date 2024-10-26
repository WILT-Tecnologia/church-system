import { Add } from '@mui/icons-material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import ContainerTable from './ContainerTable';
import NoRow from './NoRow';
import TableToolbar from './TableToolbar';

type TableProps = {
  columns: any[];
  rows: any[];
  sortingField: string;
  href?: string;
  label: string;
  isLoading: boolean;
  rowModesModel: any;
  setRowModesModel: any;
  setRows: any;
  onCreate: () => void;
} & DataGridProps;

const Table = ({
  columns,
  isLoading,
  rowModesModel,
  rows,
  setRowModesModel,
  sortingField,
  setRows,
  onCreate,
  ...rest
}: TableProps) => {
  return (
    <ContainerTable>
      <DataGrid
        {...rest}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        loading={isLoading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: sortingField, sort: 'asc' }],
          },
        }}
        slots={{
          noRowsOverlay: NoRow,
          toolbar: () => (
            <TableToolbar
              href={rest.href}
              onClick={onCreate}
              label={rest.label}
              icon={<Add />}
            />
          ),
        }}
        slotProps={{
          toolbar: {
            setRows,
            setRowModesModel,
            loadingOverlay: {
              variant: 'linear-progress',
              noRowsVariant: 'linear-progress',
            },
          },
        }}
        sx={{ '--DataGrid-overlayHeight': '18.75rem' }}
      />
    </ContainerTable>
  );
};

export default Table;
