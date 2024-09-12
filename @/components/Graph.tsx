import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

const data = Array.from({ length: 10 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
  value: 100 + i * 100
}));

const Graph: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333333" />
        <XAxis dataKey="date" tick={{ fill: '#888888' }} axisLine={{ stroke: '#333333' }} />
        <YAxis 
          tick={{ fill: '#888888' }} 
          axisLine={{ stroke: '#333333' }}
          domain={[0, 1000]}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
          labelStyle={{ color: '#888888' }}
          formatter={(value: number) => [`${value} ADA`, 'Value']}
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