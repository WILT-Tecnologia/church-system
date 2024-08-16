import Table from "@/components/Table";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import usePersonForm from "../hook/usePersonForm";

const PersonsShow = () => {
  const {
    rowModesModel,
    rows,
    loading,
    setRowModesModel,
    setRows,
    handleDeleteClick,
    handleSaveClick,
  } = usePersonForm();

  const columns: GridColDef[] = [
    {
      field: "user_id",
      headerName: "Usuário",
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "cpf",
      headerName: "CPF",
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "birth_date",
      headerName: "Data de nascimento",
      width: 200,
      renderCell: (params) => (
        <span>{dayjs(params.value).format("DD/MM/YYYY")}</span>
      ),
    },
    {
      field: "email",
      headerName: "E-mail",
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "phone_one",
      headerName: "Telefone 1",
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "phone_two",
      headerName: "Telefone 2",
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "sex",
      headerName: "Sexo",
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value === "M" ? "Masculino" : "Feminino"}>
          <span>{params.value === "M" ? "Masculino" : "Feminino"}</span>
        </Tooltip>
      ),
    },
    {
      field: "cep",
      headerName: "CEP",
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: "street",
      headerName: "Rua",
      width: 250,
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
      width: 200,
    },
    {
      field: "city",
      headerName: "Cidade",
      width: 200,
    },
    {
      field: "state",
      headerName: "Estado",
      width: 200,
    },
    {
      field: "country",
      headerName: "País",
      width: 200,
    },
    {
      field: "createdAt",
      headerName: "Criado em",
      type: "string",
      width: 200,
    },
    {
      field: "updatedAt",
      headerName: "Atualizado em",
      type: "string",
      width: 200,
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
              onClick={handleSaveClick(id)}
            />
          </Tooltip>,
          <Tooltip title="Deletar" key="delete">
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              color="error"
              onClick={handleDeleteClick(id)}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  return (
    <Table
      rows={rows}
      columns={columns}
      isLoading={loading}
      loading={loading}
      rowModesModel={rowModesModel}
      setRows={setRows}
      setRowModesModel={setRowModesModel}
      sortingField="name"
      href="/admin/administrative/persons/create"
      label="Adicionar"
    />
  );
};

export default PersonsShow;
