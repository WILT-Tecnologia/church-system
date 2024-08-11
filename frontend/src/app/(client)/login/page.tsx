"use client";

import {
  Alert,
  Button,
  Card,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import useLoginForm from "./hook/useLoginForm";
import * as S from "./styles";

import { Visibility, VisibilityOff } from "@mui/icons-material";

const SignIn = () => {
  const {
    error,
    errors,
    isSubmitting,
    showPassword,
    handleMouseDownPassword,
    handleShowPassword,
    handleSubmit,
    register,
    onSubmit,
  } = useLoginForm();

  return (
    <S.Wrapper>
      <Card variant="outlined" sx={{ p: 5 }}>
        {error && error === 401 && (
          <Alert severity="error">Usuário ou senha inválidos!</Alert>
        )}
        <Typography
          variant="h4"
          component="h4"
          color="primary"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", py: 3 }}
        >
          Faça seu login
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
              type={showPassword ? "text" : "password"}
              label="Senha"
              variant="filled"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      aria-label="Visualizar senha"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
      </Card>
    </S.Wrapper>
  );
};

export default SignIn;
