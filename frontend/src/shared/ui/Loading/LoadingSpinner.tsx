import React from 'react';
import { CircularProgress, Box, BoxProps } from '@mui/material';

export interface LoadingSpinnerProps extends BoxProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = 'primary',
  ...props
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};
