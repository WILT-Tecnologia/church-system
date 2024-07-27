"use client";
import * as S from "@/app/admin/administrative/styles";

import CTA from "@/components/Form/CTA";
import {
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from "@mui/material";
import useOfficesForm from "../hook";

export default function OfficeCreate() {
  const {
    Controller,
    control,
    errors,
    register,
    onSubmit,
    handleBack,
    handleSubmit,
    isSubmitting,
  } = useOfficesForm();

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography
          variant="h4"
          color="primary"
          sx={{ textAlign: "center", my: "1rem", fontWeight: "bold" }}
        >
          Criação de cargos
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.Inputs>
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
              required
              fullWidth
            />
          </S.Inputs>
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
                    label="Ativo"
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
