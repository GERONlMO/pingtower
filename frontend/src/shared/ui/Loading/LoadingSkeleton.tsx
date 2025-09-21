import React from 'react';
import { Skeleton, Box, BoxProps } from '@mui/material';

export interface LoadingSkeletonProps extends BoxProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  lines = 1,
  ...props
}) => {
  if (lines === 1) {
    return (
      <Skeleton
        variant={variant}
        width={width}
        height={height}
        {...props}
      />
    );
  }

  return (
    <Box {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          width={width}
          height={height}
          sx={{ mb: index < lines - 1 ? 1 : 0 }}
        />
      ))}
    </Box>
  );
};
