import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { SiteStatus } from '@shared/types';
import { getStatusColor, getStatusText } from '@shared/lib/utils';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: SiteStatus;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  size = 'small',
  ...props 
}) => {
  const color = getStatusColor(status);
  const label = getStatusText(status);

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
      {...props}
    />
  );
};
