"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Typography } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./schema";
import * as S from "./styles";

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
    <S.Wrapper>
      <Typography
        variant="h4"
        component="h4"
        sx={{ textAlign: "center", fontWeight: "bold" }}
        color="primary"
      >
        Faça login
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.WrapperForm>
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
        </S.WrapperForm>
        <S.CTA>
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
        </S.CTA>
      </form>
    </S.Wrapper>
  );
};

export default SignIn;
