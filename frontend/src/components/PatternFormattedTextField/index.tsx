import { TextField } from "@mui/material";
import { forwardRef } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { PatternFormat } from "react-number-format";

type PatternFormattedTextFieldProps = {
  field: ControllerRenderProps<any>;
  format: string;
  mask: string;
  label: string;
  error: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  onValueChange: (values: any) => void;
};

const PatternFormattedTextField = forwardRef<
  HTMLInputElement,
  PatternFormattedTextFieldProps
>(
  (
    {
      field,
      format,
      mask,
      label,
      error,
      helperText,
      required,
      fullWidth,
      onValueChange,
    },
    ref
  ) => (
    <PatternFormat
      {...field}
      inputRef={ref}
      customInput={TextField}
      format={format}
      mask={mask}
      variant="filled"
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      fullWidth={fullWidth}
      onValueChange={onValueChange}
    />
  )
);

export default PatternFormattedTextField;
