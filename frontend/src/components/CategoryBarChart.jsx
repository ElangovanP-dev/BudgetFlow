import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';

const CATEGORY_COLORS = {
  FOOD: '#3b82f6',          // blue-500
  TRANSPORT: '#f59e0b',     // amber-500
  SHOPPING: '#ec4899',      // pink-500
  BILLS: '#ef4444',         // red-500
  HEALTH: '#10b981',        // emerald-500
  ENTERTAINMENT: '#8b5cf6', // violet-500
  OTHER: '#64748b'          // slate-500
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{data.category}</p>
        <p className="text-sm font-bold text-slate-100 mt-1">
          ${parseFloat(data.total).toFixed(2)}
        </p>
        {data.budget > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">
            Budget: ${parseFloat(data.budget).toFixed(2)} ({data.pct.toFixed(0)}%)
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CategoryBarChart({ data }) {
  // Format data to ensure total is numeric
  const formattedData = data.map(item => ({
    ...item,
    total: parseFloat(item.total) || 0
  })).filter(item => item.total > 0); // Only show categories with actual spend

  if (formattedData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <p className="text-sm text-slate-400">No category spending data for this month</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="category" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => val.charAt(0) + val.slice(1).toLowerCase()}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={45}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
