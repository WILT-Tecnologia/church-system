'use client';

import Table from '@/components/Table';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import usePerson from '../hook/usePerson';

export default function ShowPerson() {
  const {
    rowModesModel,
    rows,
    isLoading,
    setRowModesModel,
    setRows,
    handleSaveClick,
    handleDeleteClick,
  } = usePerson();

  const columns: GridColDef[] = [
    {
      field: 'user_id',
      headerName: 'Usuário',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'name',
      headerName: 'Nome',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'birth_date',
      headerName: 'Data de nascimento',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={dayjs(params.value).format('DD/MM/YYYY')}>
          <span>{dayjs(params.value).format('DD/MM/YYYY')}</span>
        </Tooltip>
      ),
    },
    {
      field: 'email',
      headerName: 'E-mail',
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'phone_one',
      headerName: 'Telefone 1',
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'sex',
      headerName: 'Sexo',
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value === 'M' ? 'Masculino' : 'Feminino'}>
          <span>{params.value === 'M' ? 'Masculino' : 'Feminino'}</span>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      type: 'string',
      width: 200,
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado em',
      type: 'string',
      width: 200,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 200,
      cellClassName: 'actions',
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
      isLoading={isLoading}
      rowModesModel={rowModesModel}
      setRows={setRows}
      setRowModesModel={setRowModesModel}
      sortingField="name"
      href="/administrative/person/create"
      label="Adicionar"
    />
  );
}
