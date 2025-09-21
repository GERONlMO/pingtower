import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Box, BoxProps } from '@mui/material';

export interface SparklineProps extends BoxProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  color = '#1976d2',
  height = 40,
  width = 100,
  ...props 
}) => {
  // Transform data for recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <Box 
      width={width} 
      height={height} 
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
