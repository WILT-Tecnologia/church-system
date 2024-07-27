"use client";

import * as S from "@/app/admin/administrative/styles";
import {
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import useUsersForm from "./hook/useUsersForm";

import CTA from "@/components/Form/CTA";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

export default function UserCreate() {
  const {
    Controller,
    control,
    errors,
    register,
    onSubmit,
    handleBack,
    handleSubmit,
    isSubmitting,
    handleClickShowPassword,
    handleMouseDownPassword,
    showPassword,
  } = useUsersForm();
  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography
          variant="h4"
          color="primary"
          sx={{ textAlign: "center", my: "1rem", fontWeight: "bold" }}
        >
          Criação de usuário
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.Inputs>
            <TextField
              type="text"
              label="Login"
              {...register("login")}
              error={!!errors.login}
              helperText={errors.login?.message}
              disabled={isSubmitting}
              variant="filled"
              required
              fullWidth
            />
            <TextField
              type={showPassword ? "text" : "password"}
              label="Senha"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="filled"
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Mostrar senha"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              fullWidth
            />
          </S.Inputs>
          <S.Inputs>
            <Controller
              name="change_password"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    {...field}
                    control={<Checkbox defaultChecked={!!field.value} />}
                    disabled={isSubmitting}
                    label="Alterar a senha no próximo login?"
                  />
                </FormGroup>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    {...field}
                    control={<Checkbox defaultChecked={!!field.value} />}
                    disabled={isSubmitting}
                    label="Situação"
                  />
                </FormGroup>
              )}
            />
          </S.Inputs>
          <Divider />
          <S.CTA>
            <CTA
              labelCancel="Cancelar"
              labelConfirm="Cadastrar"
              isSubmitting={isSubmitting}
              handleBack={handleBack}
            />
          </S.CTA>
        </form>
      </Card>
    </S.Wrapper>
  );
}
