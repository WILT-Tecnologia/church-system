"use client";

import * as S from "@/app/admin/administrative/styles";
import CTA from "@/components/Form/CTA";
import { churchs } from "@/utils/mocks";
import {
  Card,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import useEventTypeForm from "../hook";

export default function EventTypeCreate() {
  const {
    control,
    errors,
    isSubmitting,
    register,
    onSubmit,
    handleBack,
    handleSubmit,
    Controller,
    handleChangeSelect,
  } = useEventTypeForm();

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography
          variant="h4"
          color="primary"
          sx={{ textAlign: "center", my: "1rem", fontWeight: "bold" }}
        >
          Criação de Tipos de eventos
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.Inputs>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    {...field}
                    control={<Checkbox defaultChecked={!!field.value} />}
                    disabled={isSubmitting}
                    label={!!field.value ? "Ativado" : "Desativado"}
                    sx={{
                      display: "flex",
                      color: !!field.value ? "green" : "red",
                      textShadow: !!field.value
                        ? "0 0 0.15rem grey"
                        : "0 0 0.15rem grey",
                      transition: "all 0.3s ease",
                    }}
                  />
                </FormGroup>
              )}
            />
          </S.Inputs>
          <S.Inputs>
            <FormControl
              fullWidth
              error={!!errors.church_id}
              variant="filled"
              required
            >
              <InputLabel id="church_id">Igreja</InputLabel>
              <Select
                id="church_id"
                type="text"
                labelId="church_id"
                label="Igreja"
                variant="filled"
                error={!!errors.church_id}
                onChange={handleChangeSelect}
                fullWidth
                required
              >
                {churchs.map((church) => (
                  <MenuItem key={church.id} value={church.id}>
                    {church.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.church_id?.message && (
                <FormHelperText>{errors.church_id?.message}</FormHelperText>
              )}
            </FormControl>
            <TextField
              type="text"
              label="Nome"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isSubmitting}
              variant="filled"
              required
              fullWidth
            />
          </S.Inputs>
          <S.Inputs>
            <TextField
              type="text"
              label="Descricão"
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isSubmitting}
              variant="filled"
              multiline
              rows={5}
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
}
