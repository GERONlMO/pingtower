import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'contained', 
  size = 'medium',
  ...props 
}) => {
  return (
    <MuiButton 
      variant={variant} 
      size={size}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
