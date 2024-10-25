'use client';

import { SnackbarContent, Stack } from '@mui/material';

export default function Error({ error }: { error: Error }) {
  return (
    <Stack
      spacing={2}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: '70dvh',
        width: '100%',
      }}
    >
      <SnackbarContent message="Ops! Algo deu errado" />
      <SnackbarContent message={`${error.message} - ${error.name}`} />
    </Stack>
  );
}
