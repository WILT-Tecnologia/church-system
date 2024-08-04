import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import usePersonForm from "../hook/usePersonForm";

const PersonsShow = () => {
  const { isLoading, rowModesModel, setRowModesModel, persons } =
    usePersonForm();

  const columns: GridColDef[] = [
    { field: "user_id", headerName: "Usuário", width: 200 },
    { field: "name", headerName: "Nome", width: 200 },
    {
      field: "cpf",
      headerName: "CPF",
      width: 130,
    },
    { field: "birth_date", headerName: "Data de nascimento", width: 200 },
    {
      field: "email",
      headerName: "E-mail",
      width: 200,
    },
    {
      field: "phone_one",
      headerName: "Telefone 1",
      width: 200,
    },
    {
      field: "phone_two",
      headerName: "Telefone 2",
      width: 200,
    },
    {
      field: "sex",
      headerName: "Sexo",
      width: 100,
    },
    {
      field: "cep",
      headerName: "CEP",
      width: 100,
    },
    {
      field: "street",
      headerName: "Rua",
      width: 120,
    },
    {
      field: "number",
      headerName: "Número",
      width: 120,
    },
    {
      field: "complement",
      headerName: "Complemento",
      width: 120,
    },
    {
      field: "district",
      headerName: "Bairro",
      width: 120,
    },
    {
      field: "city",
      headerName: "Cidade",
      width: 120,
    },
    {
      field: "state",
      headerName: "Estado",
      width: 120,
    },
    {
      field: "country",
      headerName: "País",
      width: 120,
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
      rows={persons}
      columns={columns}
      loading={isLoading}
      rowModesModel={rowModesModel}
      isLoading={false}
      setRowModesModel={setRowModesModel}
      sortingField="name"
      href="/admin/administrative/persons/create"
      label="Adicionar"
    />
  );
};

export default PersonsShow;
