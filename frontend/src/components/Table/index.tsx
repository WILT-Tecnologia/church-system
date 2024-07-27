import { Add } from "@mui/icons-material";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import ContainerTable from "../ContainerTable";
import NoRow from "../NoRow";
import TableToolbar from "./TableToolbar";

type TableProps = {
  columns: any[];
  rows: any[];
  rowModesModel: any;
  isLoading: boolean;
  sortingField: string;
  setRowModesModel: any;
  href: string;
  label: string;
} & DataGridProps;

const Table = ({
  columns,
  isLoading,
  rowModesModel,
  rows,
  setRowModesModel,
  sortingField,
  ...rest
}: TableProps) => {
  return (
    <ContainerTable>
      <DataGrid
        {...rest}
        rows={rows}
        columns={columns}
        editMode="cell"
        rowModesModel={rowModesModel}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[10, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: sortingField, sort: "asc" }],
          },
        }}
        slots={{
          noRowsOverlay: NoRow,
          toolbar: () => (
            <TableToolbar href={rest.href} label={rest.label} icon={<Add />} />
          ),
        }}
        slotProps={{
          toolbar: {
            setRowModesModel,
            loadingOverlay: {
              variant: "linear-progress",
              noRowsVariant: "linear-progress",
            },
          },
        }}
        sx={{ "--DataGrid-overlayHeight": "18.75rem" }}
      />
    </ContainerTable>
  );
};

export default Table;
