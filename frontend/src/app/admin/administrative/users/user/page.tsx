"use client";

import * as S from "@/app/admin/administrative/styles";
import {
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import CTA from "@/components/Form/CTA";
import Popup from "@/components/Popup";
import {
  Add,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useState } from "react";
import useUsersForm from "../hook/useUsersForm";

export default function UserCreate() {
  const media = useMediaQuery("(min-width: 768px)");
  const {
    control,
    errors,
    isSubmitting,
    showPassword,
    userData,
    profiles,
    Controller,
    register,
    onSubmit,
    handleBack,
    handleSubmit,
    handleClickShowPassword,
    handleMouseDownPassword,
  } = useUsersForm();

  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profiles);

  const handleOpenProfileDialog = (profiles: any) => {
    setSelectedProfile(profiles);
    setOpenProfileDialog(true);
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
    setSelectedProfile(profiles);
  };

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography
          variant={media ? "h4" : "h5"}
          color="primary"
          sx={{ my: "1rem", fontWeight: "bold" }}
        >
          {userData ? "Edição de usuário" : "Criação de usuário"}
        </Typography>
        <Typography
          variant="subtitle2"
          color="gray"
          sx={{ my: "1rem", fontWeight: "bold" }}
        >
          Informações básicas de identificação do usuário.
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
              required
              fullWidth
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
            />
          </S.Inputs>
          <Divider />
          <S.Sections>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "gray", my: "1rem" }}
            >
              Permissões e Atribuições
            </Typography>
            <Typography variant="caption" sx={{ color: "gray", mb: "2rem" }}>
              Leia a indicação de cada uma das permissões abaixo e habilite-as
              de acordo com as necessidades do usuário.
            </Typography>
            {/* Perfins */}
            <S.Section>
              <S.SectionText>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Perfis
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Associe perfis de usuário para atribuir as respectivas
                  permissões disponíveis nos mesmos.
                </Typography>
              </S.SectionText>
              <Tooltip title={userData ? "Editar Perfil" : "Selecionar Perfil"}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenProfileDialog(userData?.profile)}
                  sx={{
                    border: "0.1rem solid",
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </S.Section>
            <Divider />
            {/* Situação do usuário */}
            <S.Section>
              <S.SectionText>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Situação do usuário
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Ativando essa opção, o usuário podera ter acesso ao sistema.
                </Typography>
              </S.SectionText>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormControlLabel
                      {...field}
                      label={
                        <Typography
                          color={!!field.value ? "success.main" : "error.main"}
                          sx={{ fontWeight: "bold" }}
                        >
                          {!!field.value ? "Ativado" : "Desativado"}
                        </Typography>
                      }
                      control={
                        <Switch
                          {...field}
                          aria-label={!!field.value ? "Ativado" : "Desativado"}
                          checked={!!field.value}
                          disabled={isSubmitting}
                        />
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                )}
              />
            </S.Section>
            <Divider />
            {/* Alteração da senha no primeiro login */}
            <S.Section>
              <S.SectionText>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Alteração da senha no primeiro login
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Ativando essa opção, o usuário terá acesso e será permitido
                  alterar sua senha no primeiro login.
                </Typography>
              </S.SectionText>
              <Controller
                name="change_password"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormControlLabel
                      {...field}
                      label={
                        <Typography
                          color={!!field.value ? "success.main" : "error.main"}
                          sx={{ fontWeight: "bold" }}
                        >
                          {!!field.value ? "Ativado" : "Desativado"}
                        </Typography>
                      }
                      control={
                        <Switch
                          {...field}
                          aria-label={!!field.value ? "Ativado" : "Desativado"}
                          checked={!!field.value}
                          disabled={isSubmitting}
                        />
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                )}
              />
            </S.Section>
            <Divider />
            {/* Super Usuário */}
            <S.Section>
              <S.SectionText>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Super Usuário
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Ativando essa opção, o usuário super administrador tem a
                  permissão para conseguir informações específicas e que
                  impactam diretamente no sistema.
                </Typography>
              </S.SectionText>
              <Controller
                name="is_view_admin"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormControlLabel
                      {...field}
                      label={
                        <Typography
                          color={!!field.value ? "success.main" : "error.main"}
                          sx={{ fontWeight: "bold" }}
                        >
                          {!!field.value ? "Ativado" : "Desativado"}
                        </Typography>
                      }
                      control={
                        <Switch
                          {...field}
                          aria-label={!!field.value ? "Ativado" : "Desativado"}
                          checked={!!field.value}
                          disabled={isSubmitting}
                        />
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                )}
              />
            </S.Section>
            <Divider />
          </S.Sections>
          <S.CTA>
            <CTA
              labelCancel="Cancelar"
              labelConfirm={userData ? "Salvar" : "Cadastrar"}
              isSubmitting={isSubmitting}
              handleBack={handleBack}
            />
          </S.CTA>
        </form>
      </Card>
      <Popup
        title="Selecionar perfil"
        open={openProfileDialog}
        handleClose={handleCloseProfileDialog}
        data={profiles}
        onSubmit={onSubmit}
        setSelectData={setSelectedProfile}
        dataView={profiles
          .map((profile) => profile.name)
          .filter((name) => name === userData?.profile)}
      />
    </S.Wrapper>
  );
}
