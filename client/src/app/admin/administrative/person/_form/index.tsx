import Column from '@/components/column';
import CTA from '@/components/CTA';
import { Save } from '@mui/icons-material';
import { Button, Divider, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import dayjs from 'dayjs';
import usePerson from '../hook/usePerson';

export default function FormPerson() {
  const {
    errors,
    isSubmitting,
    register,
    handleSubmit,
    onSubmit,
    closeDialog,
    watch,
    setValue,
  } = usePerson();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Column>
        <TextField
          type="text"
          id="user_id"
          label="Usuário"
          variant="filled"
          {...register('user_id')}
          disabled={isSubmitting}
          helperText={errors.user_id?.message}
          error={errors.user_id !== undefined}
          fullWidth
        />
        <TextField
          type="text"
          id="name"
          label="Nome"
          variant="filled"
          {...register('name')}
          disabled={isSubmitting}
          helperText={errors.name?.message}
          error={errors.name !== undefined}
          required
          fullWidth
        />
        <TextField
          type="text"
          id="cpf"
          label="CPF"
          variant="filled"
          {...register('cpf')}
          disabled={isSubmitting}
          helperText={errors.cpf?.message}
          error={errors.cpf !== undefined}
          required
          fullWidth
        />
      </Column>
      <Column>
        <TextField
          type="email"
          id="email"
          label="E-mail"
          variant="filled"
          {...register('email')}
          disabled={isSubmitting}
          helperText={errors.email?.message}
          error={errors.email !== undefined}
          required
          fullWidth
        />
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          dateFormats={{ keyboardDate: 'DD/MM/YYYY' }}
          adapterLocale="pt-BR"
        >
          <DemoContainer components={['DatePicker']}>
            <DatePicker
              label="Data de nascimento"
              views={['year', 'month', 'day']}
              disabled={isSubmitting}
              loading={isSubmitting}
              value={watch('birth_date') ? dayjs(watch('birth_date')) : dayjs()}
              onChange={(value) =>
                setValue('birth_date', value, { shouldValidate: true })
              }
              slotProps={{
                textField: {
                  id: 'birth_date',
                  variant: 'filled',
                  name: 'birth_date',
                  helperText: errors.birth_date?.message,
                  error: !!errors.birth_date,
                  required: true,
                  fullWidth: true,
                },
              }}
            />
          </DemoContainer>
        </LocalizationProvider>

        {/* <TextField
          type="date"
          id="birth_date"
          label="Data de nascimento"
          variant="filled"
          {...register('birth_date')}
          disabled={isSubmitting}
          helperText={errors.birth_date?.message}
          error={errors.birth_date !== undefined}
          required
          fullWidth
        /> */}
      </Column>
      <Column>
        <TextField label="Sexo" variant="filled" required fullWidth />
        <TextField label="Celular" variant="filled" required fullWidth />
        <TextField
          label="Telefone residencial"
          variant="filled"
          required
          fullWidth
        />
      </Column>
      <Divider />
      <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
        Endereço
      </Typography>
      <Column>
        <TextField label="CEP" variant="filled" required />
        <TextField label="Rua" variant="filled" required fullWidth />
      </Column>
      <Column>
        <TextField label="Número" variant="filled" required fullWidth />
        <TextField label="Complemento" variant="filled" required fullWidth />
        <TextField label="Bairro" variant="filled" required fullWidth />
      </Column>
      <Column>
        <TextField label="Cidade" variant="filled" required fullWidth />
        <TextField label="Estado" variant="filled" required fullWidth />
        <TextField label="País" variant="filled" required fullWidth />
      </Column>
      <Divider />
      <CTA>
        <Button
          onClick={closeDialog}
          type="button"
          variant="outlined"
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          startIcon={<Save />}
          type="submit"
          variant="contained"
          color="primary"
        >
          Salvar
        </Button>
      </CTA>
    </form>
  );
}
