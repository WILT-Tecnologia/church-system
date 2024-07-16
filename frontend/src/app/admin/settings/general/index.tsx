import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";

import PatternFormattedTextField from "@/components/PatternFormattedTextField";
import useGeneralSettingsForm from "@/hooks/GeneralSettings/useGeneralSettingsForm";
import * as S from "./styles";

export default function GeneralSettings() {
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
  } = useGeneralSettingsForm();

  return (
    <Box>
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
          <TextField
            type="text"
            label="Nome Fantasia"
            variant="filled"
            {...register("fantasyName")}
            error={!!errors.fantasyName}
            helperText={errors.fantasyName?.message}
            required
            fullWidth
          />
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
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PatternFormattedTextField
                field={field}
                format="(##) #####-####"
                mask="_"
                label="Celular"
                error={!!errors.phone}
                helperText={
                  errors.phone?.message ||
                  "De preferência, informe o número do WhatsApp."
                }
                required
                fullWidth
                onValueChange={(values) => {
                  field.onChange(values.value);
                }}
              />
            )}
          />
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
        <S.Footer>
          <Typography variant="subtitle2" color="gray" sx={{ my: "1rem" }}>
            Última alteração em 22/03/2022 às 12:00 por Peixola
          </Typography>
          <S.CTA>
            <Button type="reset" color="inherit" variant="outlined">
              Cancelar
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Salvar
            </Button>
          </S.CTA>
        </S.Footer>
      </form>
    </Box>
  );
}
