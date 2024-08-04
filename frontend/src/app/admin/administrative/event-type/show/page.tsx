import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import useEventTypeForm from "../hook";

export default function EventTypeShow() {
  const { isLoading, rowModesModel, setRowModesModel, eventType } =
    useEventTypeForm();

  const columns: GridColDef[] = [
    { field: "church_id", headerName: "Igreja", width: 200 },
    { field: "name", headerName: "Nome", width: 200 },
    {
      field: "description",
      headerName: "Descrição",
      width: 300,
    },
    {
      field: "status",
      headerName: "Status",
      type: "boolean",
      width: 200,
      renderCell: (params) => {
        return (
          <Chip
            label={params.value ? "Ativo" : "Inativo"}
            color={params.value ? "success" : "error"}
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Criado em",
      type: "string",
      width: 200,
      editable: false,
    },
    {
      field: "updated_at",
      headerName: "Atualizado em",
      type: "string",
      width: 200,
      editable: false,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 200,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <Tooltip title="Editar" key="edit">
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              color="primary"
            />
          </Tooltip>,
          <Tooltip title="Deletar" key="delete">
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              color="error"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <Table
      rows={eventType}
      columns={columns}
      loading={isLoading}
      isLoading={isLoading}
      rowModesModel={rowModesModel}
      setRowModesModel={setRowModesModel}
      sortingField="name"
      href="/admin/administrative/event-type/create"
      label="Adicionar"
    />
  );
}
