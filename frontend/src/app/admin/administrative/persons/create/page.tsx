'use client';

import * as S from '@/app/admin/administrative/styles';

import CTA from '@/components/Form/CTA';
import Loading from '@/components/Loading';
import MaskedTextField from '@/components/PatternFormattedTextField';
import { cpfMasked, phoneMasked } from '@/utils/masks';
import {
  Alert,
  Card,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import usePersonForm from '../hook/usePersonForm';

const PersonCreate = () => {
  const {
    isSubmitting,
    control,
    loadingCircular,
    streetValue,
    districtValue,
    stateValue,
    cityValue,
    errors,
    messageValue,
    onSubmit,
    handleSubmit,
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
          sx={{ textAlign: 'center', my: '1rem', fontWeight: 'bold' }}
        >
          Pessoa
        </Typography>
        {messageValue && <Alert severity="error">{messageValue}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography color="gray" sx={{ my: '1rem', fontWeight: 'bold' }}>
            Dados básicos
          </Typography>
          <S.Inputs>
            <TextField
              type="text"
              label="Usuário"
              {...register('user_id')}
              error={!!errors.user_id}
              helperText={errors.user_id?.message}
              variant="filled"
              //required
              fullWidth
            />
            <TextField
              type="text"
              label="Nome"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              variant="filled"
              required
              fullWidth
            />
            <MaskedTextField
              control={control}
              name="cpf"
              format="###.###.###-##"
              label="CPF"
              maskFunction={cpfMasked}
              error={!!errors.cpf}
              helperText={errors.cpf?.message}
              variant="filled"
              required
              fullWidth
            />
            <TextField
              type="text"
              label="E-mail"
              {...register('email')}
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
              {...register('birth_date')}
              error={!!errors.birth_date}
              helperText={errors.birth_date?.message}
              variant="filled"
              InputLabelProps={{
                shrink: true,
              }}
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
            <MaskedTextField
              control={control}
              label="Celular"
              name="phone_one"
              format="(##)#####-####"
              maskFunction={phoneMasked}
              error={!!errors.phone_one}
              helperText={
                errors.phone_one?.message ||
                'De preferência, informe o Whatsapp.'
              }
              variant="filled"
              required
              fullWidth
            />
            <MaskedTextField
              control={control}
              label="Telefone II"
              name="phone_two"
              format="(##)#####-####"
              maskFunction={phoneMasked}
              error={!!errors.phone_two}
              helperText={errors.phone_two?.message}
              variant="filled"
              fullWidth
            />
          </S.Inputs>
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
            {loadingCircular && <Loading />}
            {/* <CircularProgress
              ref={loadingRef}
              style={{ display: 'none' }}
              size={24}
            /> */}
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
              {...register('district')}
              error={!!errors.district}
              helperText={errors.district?.message}
              disabled={isSubmitting}
              InputLabelProps={{
                shrink: !!districtValue,
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
            <TextField
              type="text"
              label="País"
              variant="filled"
              {...register('country')}
              error={!!errors.country}
              helperText={errors.country?.message}
              disabled={isSubmitting}
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
