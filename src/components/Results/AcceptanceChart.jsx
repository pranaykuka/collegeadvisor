import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getTrendData } from '../../utils/formatters.js';

export default function AcceptanceChart({ school }) {
  const data = getTrendData(school);

  if (data.length < 2) {
    return <p className="text-xs text-slate-400 italic">Trend data unavailable</p>;
  }

  const first = data[0].rate;
  const last  = data[data.length - 1].rate;
  const trend = last < first ? 'Increasingly selective ↘' : last > first ? 'Becoming more accessible ↗' : 'Stable →';
  const trendColor = last < first ? 'text-red-500' : last > first ? 'text-green-500' : 'text-slate-500';

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-slate-600">Acceptance Rate Trend</span>
        <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={v => [`${(v * 100).toFixed(1)}%`, 'Accept Rate']}
            contentStyle={{ fontSize: 11, padding: '4px 8px' }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
