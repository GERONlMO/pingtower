import React from 'react';
import { FormControl, InputLabel, Select, SelectProps, MenuItem, FormHelperText } from '@mui/material';

export interface FormSelectProps extends Omit<SelectProps, 'error'> {
  label: string;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  helperText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  error,
  helperText,
  ...props
}) => {
  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
