import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Checkbox, Chip, Tooltip } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import useUsersForm from "../hook/useUsersForm";

const Users = () => {
  const { users, isLoading, rowModesModel, router, setRowModesModel } =
    useUsersForm();

  const columns: GridColDef[] = [
    { field: "login", headerName: "Usuário", width: 200 },
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
      field: "change_password",
      headerName: "Alterar senha no primeiro login",
      width: 220,
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
      field: "is_view_admin",
      headerName: "Super administrador",
      width: 220,
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
      field: "profile",
      headerName: "Perfil",
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip color="primary" variant="outlined" label={params.value} />
      ),
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
                router.push(`/admin/administrative/users/user?id=${id}`)
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
      rows={users}
      columns={columns}
      loading={isLoading}
      rowModesModel={rowModesModel}
      isLoading={false}
      setRowModesModel={setRowModesModel}
      sortingField="username"
      href="/admin/administrative/users/user"
      label="Adicionar"
    />
  );
};

export default Users;
