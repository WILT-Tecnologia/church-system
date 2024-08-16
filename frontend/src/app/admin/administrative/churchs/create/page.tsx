'use client';

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
} from '@mui/material';
import { Controller } from 'react-hook-form';

import * as S from '@/app/admin/administrative/styles';
import ErrorMessage from '@/components/ErrorMessage';
import CTA from '@/components/Form/CTA';
import MaskedTextField from '@/components/PatternFormattedTextField';
import useChurchForm from '../hooks';

export default function Churchs() {
  const {
    loadingRef,
    control,
    errors,
    isSubmitting,
    streetValue,
    neighborhoodValue,
    cityValue,
    stateValue,
    register,
    handleSubmit,
    handleCepChange,
    onSubmit,
    handleBack,
    handleChangeShepherd,
  } = useChurchForm();

  return (
    <S.Wrapper>
      <Card variant="elevation" sx={{ p: 3 }}>
        <Typography color="gray" sx={{ my: '1rem', fontWeight: 'bold' }}>
          Identificação
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.Inputs>
            <TextField
              type="text"
              label="Nome"
              variant="filled"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              required
              fullWidth
            />
            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <MaskedTextField
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
              {...register('email')}
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
              {...register('site')}
              error={!!errors.site}
              helperText={errors.site?.message}
              required
              fullWidth
            />
            <FormControl
              fullWidth
              error={!!errors.responsible_id}
              variant="filled"
              required
            >
              <InputLabel id=".responsible_id">Pastor responsável</InputLabel>
              <Select
                id=".responsible_id"
                type="text"
                labelId=".responsible_id"
                label="Pastor responsável"
                variant="filled"
                error={!!errors.responsible_id}
                onChange={handleChangeShepherd}
                fullWidth
                required
              >
                <MenuItem value="1">Pastor 1</MenuItem>
                <MenuItem value="2">Pastor 2</MenuItem>
                <MenuItem value="3">Pastor 3</MenuItem>
              </Select>
              {errors.responsible_id?.message && (
                <ErrorMessage>{errors.responsible_id?.message}</ErrorMessage>
              )}
            </FormControl>
          </S.Inputs>
          <Divider />
          <Typography color="gray" sx={{ my: '1rem', fontWeight: 'bold' }}>
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
                    const value = e.target.value.replace(/\D/g, '');
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
                    pattern: '[0-9]{8}',
                  }}
                />
              )}
            />
            <div ref={loadingRef} style={{ display: 'none' }}>
              <CircularProgress size={24} />
            </div>
            <TextField
              type="text"
              label="Rua"
              variant="filled"
              {...register('street')}
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
              {...register('number')}
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
              {...register('complement')}
              error={!!errors.complement}
              helperText={errors.complement?.message}
              disabled={isSubmitting}
              fullWidth
            />
            <TextField
              type="text"
              label="Bairro"
              variant="filled"
              {...register('neighborhood')}
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
              {...register('city')}
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
              {...register('state')}
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
}
