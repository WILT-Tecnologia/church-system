"use client";

import {
  Card,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";

import PatternFormattedTextField from "@/components/PatternFormattedTextField";

import * as S from "@/app/admin/administrative/styles";
import ErrorMessage from "@/components/ErrorMessage";
import CTA from "@/components/Form/CTA";
import useChurchForm from "../hooks/ChurchSettings/useChurchForm";

export default function Churchs() {
  const {
    loadingRef,
    register,
    control,
    handleSubmit,
    errors,
    isSubmitting,
    handleCepChange,
    streetValue,
    neighborhoodValue,
    cityValue,
    stateValue,
    onSubmit,
    setValue,
    handleBack,
  } = useChurchForm();

  const handleChangeShepherd = (event: SelectChangeEvent) => {
    setValue("shepherd", event.target.value as string);
  };

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography color="gray" sx={{ my: "1rem", fontWeight: "bold" }}>
          Identificação
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.Inputs>
            <TextField
              type="text"
              label="Nome"
              variant="filled"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
              fullWidth
            />
            {/* <TextField
              type="text"
              label="Nome Fantasia"
              variant="filled"
              {...register("fantasyName")}
              error={!!errors.fantasyName}
              helperText={errors.fantasyName?.message}
              required
              fullWidth
            /> */}
          </S.Inputs>
          <S.Inputs>
            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <PatternFormattedTextField
                  field={field}
                  format="##.###.###/####-##"
                  mask="_"
                  label="CNPJ"
                  error={!!errors.cnpj}
                  helperText={errors.cnpj?.message}
                  required
                  fullWidth
                  onValueChange={(values) => {
                    field.onChange(values.value);
                  }}
                />
              )}
            />
            <TextField
              type="email"
              label="E-mail"
              variant="filled"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              required
              fullWidth
            />
          </S.Inputs>
          <S.Inputs>
            <TextField
              type="url"
              label="Site"
              variant="filled"
              {...register("site")}
              error={!!errors.site}
              helperText={errors.site?.message}
              required
              fullWidth
            />
            <FormControl
              fullWidth
              error={!!errors.shepherd}
              variant="filled"
              required
            >
              <InputLabel id="shepherd">Pastor responsável</InputLabel>
              <Select
                id="shepherd"
                type="text"
                labelId="shepherd"
                label="Pastor responsável"
                variant="filled"
                error={!!errors.shepherd}
                onChange={handleChangeShepherd}
                fullWidth
                required
              >
                <MenuItem value="1">Pastor 1</MenuItem>
                <MenuItem value="2">Pastor 2</MenuItem>
                <MenuItem value="3">Pastor 3</MenuItem>
              </Select>
              {errors.shepherd?.message && (
                <ErrorMessage>{errors.shepherd?.message}</ErrorMessage>
              )}
            </FormControl>
          </S.Inputs>
          <Divider />
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
            <div ref={loadingRef} style={{ display: "none" }}>
              <CircularProgress size={24} />
            </div>
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
          {/* <S.Footer> */}
          {/* <Typography variant="subtitle2" color="gray" sx={{ my: "1rem" }}>
              Última alteração em 22/03/2022 às 12:00 por Peixola
            </Typography> */}
          <S.CTA>
            <CTA
              labelCancel="Cancelar"
              labelConfirm="Cadastrar"
              isSubmitting={isSubmitting}
              handleBack={handleBack}
            />
          </S.CTA>
          {/* </S.Footer> */}
        </form>
      </Card>
    </S.Wrapper>
  );
}
