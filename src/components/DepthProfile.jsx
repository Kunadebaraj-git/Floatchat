import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DepthProfile = ({ floatId, parameter }) => {
  // Mock depth profile data
  const mockProfileData = [
    { depth: 0, salinity: 35.1, temperature: 28.5, oxygen: 5.2 },
    { depth: 100, salinity: 35.3, temperature: 25.1, oxygen: 4.8 },
    { depth: 200, salinity: 35.5, temperature: 20.3, oxygen: 4.2 },
    { depth: 500, salinity: 35.8, temperature: 15.7, oxygen: 3.5 },
    { depth: 1000, salinity: 36.2, temperature: 8.2, oxygen: 2.1 },
    { depth: 2000, salinity: 36.5, temperature: 3.1, oxygen: 1.2 },
  ];

  const parameterConfig = {
    salinity: { unit: 'PSU', color: '#0ea5e9', name: 'Salinity' },
    temperature: { unit: '°C', color: '#ef4444', name: 'Temperature' },
    oxygen: { unit: 'ml/l', color: '#10b981', name: 'Oxygen' }
  };

  const config = parameterConfig[parameter] || parameterConfig.salinity;

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 mt-4 border border-cyan-500/30">
      <h4 className="text-cyan-300 font-semibold mb-4 text-lg">
        Depth Profile - {config.name} (ARGO Float {floatId})
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={mockProfileData} 
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="depth" 
              label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              label={{ 
                value: `${config.name} (${config.unit})`, 
                angle: -90, 
                position: 'insideLeft', 
                offset: -10,
                fill: '#9ca3af'
              }}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value) => [`${value} ${config.unit}`, config.name]}
              labelFormatter={(label) => `Depth: ${label}m`}
            />
            <Line 
              type="monotone" 
              dataKey={parameter} 
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: config.color, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-cyan-200 text-sm mt-2 text-center">
        Showing vertical profile of {config.name.toLowerCase()} from surface to maximum depth
      </p>
    </div>
  );
};

export default DepthProfile;