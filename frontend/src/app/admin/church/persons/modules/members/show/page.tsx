import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Checkbox, Tooltip } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import router from "next/router";
import useMembersForm from "../hook/useMembersForm";

export default function ShowMembers() {
  const { isLoading, rowModesModel, setRowModesModel } = useMembersForm();
  const columns: GridColDef[] = [
    { field: "church_id", headerName: "Igreja", width: 200 },
    { field: "rg", headerName: "Número de identidade", width: 200 },
    { field: "issuing_body", headerName: "Orgão emissor", width: 200 },
    { field: "civil_status", headerName: "Estado civil", width: 200 },
    { field: "nationality", headerName: "Nacionalidade", width: 200 },
    { field: "naturalness", headerName: "Naturalidade", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return params.value ? (
          <Tooltip title="Ativado">
            <Checkbox checked={!!params.value} color="secondary" />
          </Tooltip>
        ) : (
          <Tooltip title="Desativado">
            <Checkbox checked={!!params.value} color="error" />
          </Tooltip>
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
              onClick={() =>
                router.push(
                  `/admin/church/persons/modules/members/member?id=${id}`
                )
              }
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
      rows={[]}
      columns={columns}
      loading={isLoading}
      rowModesModel={rowModesModel}
      isLoading={false}
      setRowModesModel={setRowModesModel}
      sortingField="username"
      href="/admin/church/persons/modules/members/member"
      label="Adicionar"
    />
  );
}
