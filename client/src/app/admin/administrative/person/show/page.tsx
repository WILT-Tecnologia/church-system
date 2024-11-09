'use client';

import GenericDialog from '@/components/GenericDialog';
import Table from '@/components/Table';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Button, Tooltip, Typography } from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import FormPerson from '../_form';
import usePerson from '../hook/usePerson';

export default function ShowPerson() {
  const {
    rowModesModel,
    rows,
    isLoading,
    openPopup,
    dialogType,
    selectedRow,
    setRows,
    setRowModesModel,
    handleCreateClick,
    handleSaveClick,
    handleDeleteClick,
    closeDialog,
  } = usePerson();

  const columns: GridColDef[] = [
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
      width: 140,
      renderCell: (params) => (
        <Tooltip title={params.value}>{params.value}</Tooltip>
      ),
    },
    {
      field: 'birth_date',
      headerName: 'Data de nascimento',
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
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
      headerName: 'Celular',
      width: 150,
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

  const renderDialogContent = () => {
    switch (dialogType) {
      case 'create':
        return <FormPerson />;
      case 'edit':
        return <FormPerson />;
      case 'delete':
        return (
          <Typography variant="body1" color="textSecondary">
            Ao clicar em confirmar, o registro será excluido permanentemente!
            {<br />}
            <strong>Tem certeza ?</strong>
          </Typography>
        );
      default:
    }
  };

  const renderDialogFooter = () => {
    switch (dialogType) {
      case 'delete':
        return (
          <>
            <Button onClick={closeDialog} color="inherit" variant="outlined">
              Cancelar
            </Button>
            <Button
              onClick={() => handleDeleteClick(selectedRow.id)}
              color="error"
              variant="contained"
            >
              Confirmar
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button onClick={closeDialog} color="inherit" variant="outlined">
              Cancelar
            </Button>
            <Button onClick={closeDialog} color="primary" variant="contained">
              Salvar
            </Button>
          </>
        );
    }
  };

  const renderTitle = (): string => {
    switch (dialogType) {
      case 'create':
        return 'Criar Pessoa';
      case 'edit':
        return `Editar Pessoa ${selectedRow?.name}`;
      case 'delete':
        return 'Tem certeza ?';
      default:
        return 'create';
    }
  };

  return (
    <>
      <Table
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        rowModesModel={rowModesModel}
        setRows={setRows}
        setRowModesModel={setRowModesModel}
        sortingField="name"
        onCreate={handleCreateClick}
        label="Adicionar"
      />
      <GenericDialog
        open={openPopup}
        title={renderTitle}
        content={renderDialogContent()}
        footer={renderDialogFooter()}
        onClose={closeDialog}
        maxWidth={'lg'}
        fullWidth={true}
      />
    </>
  );
}
