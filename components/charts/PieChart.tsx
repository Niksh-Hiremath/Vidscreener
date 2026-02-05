'use client';

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  innerRadius?: number;
}

export default function PieChart({ 
  data, 
  colors = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'],
  height = 260,
  innerRadius = 60
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
          labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          formatter={(value) => <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
