"use client";

import * as S from "@/app/admin/administrative/styles";
import CTA from "@/components/Form/CTA";
import {
  Card,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import usePersonForm from "./hook/usePersonForm";

const PersonCreate = () => {
  const {
    onSubmit,
    handleSubmit,
    isSubmitting,
    cityValue,
    control,
    loadingRef,
    neighborhoodValue,
    stateValue,
    streetValue,
    errors,
    handleCepChange,
    register,
    handleBack,
  } = usePersonForm();

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography
          variant="h4"
          color="primary"
          sx={{ textAlign: "center", my: "1rem", fontWeight: "bold" }}
        >
          Pessoa
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography color="gray" sx={{ my: "1rem", fontWeight: "bold" }}>
            Dados básicos
          </Typography>
          <S.Inputs>
            <TextField
              type="text"
              label="Nome"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              variant="filled"
              required
              fullWidth
            />
            <TextField
              type="text"
              label="CPF"
              {...register("cpf")}
              error={!!errors.cpf}
              helperText={errors.cpf?.message}
              variant="filled"
              required
              fullWidth
            />
            <TextField
              type="text"
              label="E-mail"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              variant="filled"
              required
              fullWidth
            />
          </S.Inputs>
          <S.Inputs>
            <TextField
              type="date"
              label="Data de nascimento"
              {...register("birth_date")}
              error={!!errors.birth_date}
              helperText={
                errors.birth_date?.message ||
                "De preferência, informe o Whatsapp."
              }
              variant="filled"
              required
              fullWidth
            />
            <Controller
              name="sex"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={!!errors.sex}
                  variant="filled"
                >
                  <InputLabel id="sex">Sexo</InputLabel>
                  <Select
                    labelId="sex"
                    id="sex"
                    label="Sexo"
                    {...field}
                    fullWidth
                    error={!!errors.sex}
                    variant="filled"
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Feminino</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <TextField
              type="text"
              label="Celular"
              {...register("phone_one")}
              error={!!errors.phone_one}
              helperText={
                errors.phone_one?.message ||
                "De preferência, informe o Whatsapp."
              }
              variant="filled"
              required
              fullWidth
            />
            <TextField
              type="text"
              label="Telefone 2"
              {...register("phone_two")}
              error={!!errors.phone_two}
              helperText={errors.phone_two?.message}
              variant="filled"
              fullWidth
            />
          </S.Inputs>
          <Typography color="gray" sx={{ my: "1rem", fontWeight: "bold" }}>
            Endereço
          </Typography>
          <S.Inputs>
            <Controller
              name="cep"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CEP"
                  variant="filled"
                  error={!!errors.cep}
                  helperText={errors.cep?.message}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 8) {
                      field.onChange(value);
                      if (value.length === 8) {
                        handleCepChange(value);
                      }
                    }
                  }}
                  value={field.value}
                  required
                  inputProps={{
                    maxLength: 8,
                    pattern: "[0-9]{8}",
                  }}
                />
              )}
            />
            <CircularProgress
              ref={loadingRef}
              style={{ display: "none" }}
              size={24}
            />
            <TextField
              type="text"
              label="Rua"
              variant="filled"
              {...register("street")}
              error={!!errors.street}
              helperText={errors.street?.message}
              disabled={isSubmitting}
              InputLabelProps={{
                shrink: !!streetValue,
              }}
              required
              fullWidth
            />
            <TextField
              type="text"
              label="Número"
              variant="filled"
              {...register("number")}
              error={!!errors.number}
              helperText={errors.number?.message}
              disabled={isSubmitting}
              required
            />
          </S.Inputs>
          <S.Inputs>
            <TextField
              type="text"
              label="Complemento"
              variant="filled"
              {...register("complement")}
              error={!!errors.complement}
              helperText={errors.complement?.message}
              disabled={isSubmitting}
              fullWidth
            />
            <TextField
              type="text"
              label="Bairro"
              variant="filled"
              {...register("neighborhood")}
              error={!!errors.neighborhood}
              helperText={errors.neighborhood?.message}
              disabled={isSubmitting}
              InputLabelProps={{
                shrink: !!neighborhoodValue,
              }}
              required
              fullWidth
            />
            <TextField
              type="text"
              label="Cidade"
              variant="filled"
              {...register("city")}
              error={!!errors.city}
              helperText={errors.city?.message}
              disabled={isSubmitting}
              InputLabelProps={{
                shrink: !!cityValue,
              }}
              required
              fullWidth
            />
            <TextField
              type="text"
              label="Estado"
              variant="filled"
              {...register("state")}
              error={!!errors.state}
              helperText={errors.state?.message}
              disabled={isSubmitting}
              InputLabelProps={{
                shrink: !!stateValue,
              }}
              required
              fullWidth
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
};

export default PersonCreate;
