import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import {
  GridActionsCellItem,
  GridColDef,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Users = () => {
  const {
    formState: { errors, isSubmitting, isLoading },
  } = useForm();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const columns: GridColDef[] = [
    { field: "username", headerName: "Usuário", width: 200 },
    {
      field: "status",
      headerName: "Situação",
      width: 200,
    },
    {
      field: "formattedCreatedAt",
      headerName: "Criado em",
      type: "string",
      width: 200,
      editable: false,
    },
    {
      field: "formattedUpdatedAt",
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
      columns={columns}
      rows={[]}
      loading={isLoading}
      rowModesModel={rowModesModel}
      isLoading={false}
      setRowModesModel={setRowModesModel}
      sortingField="username"
      href="/admin/administrative/users/create"
      label="Adicionar"
    />
  );
};

export default Users;
