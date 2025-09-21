import React from 'react';
import { FormControlLabel, Checkbox, CheckboxProps, FormHelperText, Box } from '@mui/material';

export interface FormCheckboxProps extends Omit<CheckboxProps, 'error'> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <Box>
      <FormControlLabel
        control={<Checkbox {...props} />}
        label={label}
      />
      {(error || helperText) && (
        <FormHelperText error={!!error}>
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
