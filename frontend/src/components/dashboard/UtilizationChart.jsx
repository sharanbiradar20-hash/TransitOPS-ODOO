import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const UtilizationChart = ({ activeVehicles = 0, availableVehicles = 0, vehiclesInMaintenance = 0, fleetUtilization = 0 }) => {
  // Setup data for the donut chart
  const data = [
    { name: 'Active (On Trip)', value: activeVehicles, color: '#3b82f6' }, // blue
    { name: 'Available', value: availableVehicles, color: '#10b981' }, // green
    { name: 'In Shop (Maintenance)', value: vehiclesInMaintenance, color: '#f59e0b' }, // amber
  ];

  // Filter out zero values so they don't crowd the chart or legend
  const chartData = data.filter(d => d.value > 0);

  // If no data is present, show a placeholder representation
  const isEmpty = chartData.length === 0;
  const displayData = isEmpty 
    ? [{ name: 'No Vehicles', value: 1, color: '#cbd5e1' }]
    : chartData;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (isEmpty) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-title">
        <span>Fleet Distribution</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
          Utilization: {fleetUtilization}%
        </span>
      </div>
      
      <div style={{ flex: 1, position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [isEmpty ? 0 : value, name]} 
              contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.85rem' }} 
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Central Text for utilization */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
            {fleetUtilization}%
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
            Utilized
          </span>
        </div>
      </div>
    </div>
  );
};

export default UtilizationChart;
