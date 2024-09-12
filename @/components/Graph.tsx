import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

interface GraphProps {
  data: { date: string; value: number }[];
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333333" />
        <XAxis dataKey="date" tick={{ fill: '#888888' }} axisLine={{ stroke: '#333333' }} />
        <YAxis 
          tick={{ fill: '#888888' }} 
          axisLine={{ stroke: '#333333' }}
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
          labelStyle={{ color: '#888888' }}
          formatter={(value: number) => [`${value} ADA`, 'Profit/Loss']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#22c55e"
          strokeWidth={2} 
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;