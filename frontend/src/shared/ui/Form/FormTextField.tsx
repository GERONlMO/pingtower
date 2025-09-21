import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface FormTextFieldProps extends Omit<TextFieldProps, 'error'> {
  error?: string;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  error,
  helperText,
  ...props
}) => {
  return (
    <TextField
      error={!!error}
      helperText={error || helperText}
      fullWidth
      margin="normal"
      {...props}
    />
  );
};
