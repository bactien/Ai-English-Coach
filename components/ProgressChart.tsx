
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgressData } from '../types';

interface ProgressChartProps {
  data: ProgressData[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <div className="bg-brand-surface p-4 rounded-xl shadow-lg h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="day" stroke="#8E8E93" />
          <YAxis stroke="#8E8E93" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2C2C2E',
              border: '1px solid #444',
              color: '#FFFFFF'
            }}
            labelStyle={{ color: '#8E8E93' }}
          />
          <Bar dataKey="minutesSpoken" fill="#007AFF" name="Minutes Spoken" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
