"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField, Typography } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./schema";

type Schema = z.infer<typeof schema>;

type SignInProps = {
  email: string;
  password: string;
};

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInProps>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Schema> = (data: SignInProps) => {
    console.log(data);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        padding: "10rem",
        width: "100%",
        height: "100%",
      }}
    >
      <Typography
        variant="h4"
        component="h4"
        sx={{ textAlign: "center" }}
        color="primary"
      >
        Faça login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            width: "30dvw",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <TextField
            type="email"
            label="Email"
            variant="filled"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting}
            fullWidth
            required
          />
          <TextField
            type="password"
            label="Senha"
            variant="filled"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting}
            fullWidth
            required
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            width: "30dvw",
            marginTop: "2rem",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            color="primary"
            disabled={isSubmitting}
            fullWidth
          >
            Entrar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SignIn;
