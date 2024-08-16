import { TextField, TextFieldProps } from '@mui/material';
import { Controller } from 'react-hook-form';

type MaskedTextFieldProps = TextFieldProps & {
  name: string;
  control: any;
  format: string;
  maskFunction: (value: string) => string;
};

const MaskedTextField = ({
  name,
  control,
  label,
  format,
  maskFunction,
  ...props
}: MaskedTextFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { onChange, value, ...rest } = field;

        // Função para manipular mudanças no campo
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const unmaskedValue = e.target.value;
          const newValue = maskFunction(unmaskedValue);
          onChange(newValue.replace(/\D/g, ''));
        };

        return (
          <TextField
            label={label}
            value={maskFunction(value)}
            onChange={handleChange}
            {...rest}
            {...props}
          />
        );
      }}
    />
  );
};

export default MaskedTextField;
