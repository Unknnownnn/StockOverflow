import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CandlestickChart = ({ data, title }) => {
  // Transform data for recharts
  const chartData = data.map(item => ({
    date: new Date(item.x).toLocaleDateString(),
    open: item.y[0],
    high: item.y[1],
    low: item.y[2],
    close: item.y[3],
    volume: item.y[4] || 0
  }));

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" stroke="#e0e0e0" />
          <YAxis stroke="#e0e0e0" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 30, 30, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#e0e0e0'
            }}
          />
          <Legend />
          <Bar
            dataKey="volume"
            fill="#8884d8"
            opacity={0.3}
            name="Volume"
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#03dac6"
            dot={false}
            name="Close"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart; 