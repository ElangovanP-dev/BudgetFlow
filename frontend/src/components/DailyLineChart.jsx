import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-slate-400">
          {new Date(data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-sm font-bold text-blue-400 mt-1">
          Cumulative: ${data.cumulative.toFixed(2)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Daily Spend: ${data.amount.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DailyLineChart({ data }) {
  // Sort and calculate cumulative totals
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Clone and sort by date ascending
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let sum = 0;
    return sorted.map(item => {
      const dailyAmount = parseFloat(item.amount) || 0;
      sum += dailyAmount;
      return {
        date: item.date,
        amount: dailyAmount,
        cumulative: sum
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <p className="text-sm text-slate-400">No expense records for this month</p>
      </div>
    );
  }

  // Format date ticks for XAxis
  const formatXAxis = (tickItem) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return tickItem;
    }
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxis}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 4, stroke: '#1e293b', strokeWidth: 1, fill: '#3b82f6' }}
            activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2, fill: '#60a5fa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
