"use client";

import { Button, SnackbarContent, Stack } from "@mui/material";

export default function Error({ error }: { error: Error }) {
  const action = (
    <Button color="secondary" size="small">
      lorem ipsum dolorem
    </Button>
  );

  return (
    <Stack
      spacing={2}
      sx={{
        maxWidth: 600,
        mx: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        height: "70dvh",
        width: "100%",
      }}
    >
      <SnackbarContent message="Ops! Algo deu errado" />
      <SnackbarContent message={`${error.message} - ${error.name}`} />
    </Stack>
  );
}
