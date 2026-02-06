/**
 * Sentinel Dashboard Component
 * 
 * Public health surveillance dashboard for monitoring symptom patterns and hotspots
 * Uses Nature-Tech aesthetic with glassmorphism design
 * 
 * Requirements: 4.1, 4.2, 4.3, 9.1, 9.2
 */

'use client';

import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, MapPin, Calendar } from 'lucide-react';
import type { SymptomHotspot } from '@/types';

interface SentinelMapProps {
  hotspots?: SymptomHotspot[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Nature-Tech color palette
const COLORS = {
  primary: '#2D5A27',
  primaryLight: '#3d7a37',
  accent: '#8BC34A',
  background: '#F0F4F1',
  high: '#d32f2f',
  medium: '#f57c00',
  low: '#388e3c'
};

// Mock data for demonstration
const MOCK_HOTSPOTS: SymptomHotspot[] = [
  { region: 'Delhi NCR', pincode: '110001', symptomType: 'Fever', count: 245, timestamp: Date.now(), severity: 'high' },
  { region: 'Mumbai', pincode: '400001', symptomType: 'Cough', count: 189, timestamp: Date.now(), severity: 'medium' },
  { region: 'Bangalore', pincode: '560001', symptomType: 'Headache', count: 156, timestamp: Date.now(), severity: 'medium' },
  { region: 'Chennai', pincode: '600001', symptomType: 'Fever', count: 134, timestamp: Date.now(), severity: 'medium' },
  { region: 'Kolkata', pincode: '700001', symptomType: 'Body Pain', count: 98, timestamp: Date.now(), severity: 'low' },
  { region: 'Hyderabad', pincode: '500001', symptomType: 'Fatigue', count: 87, timestamp: Date.now(), severity: 'low' },
];

// Mock trend data (last 7 days)
const MOCK_TREND_DATA = [
  { date: 'Mon', fever: 180, cough: 120, headache: 90 },
  { date: 'Tue', fever: 195, cough: 135, headache: 105 },
  { date: 'Wed', fever: 210, cough: 145, headache: 115 },
  { date: 'Thu', fever: 225, cough: 160, headache: 130 },
  { date: 'Fri', fever: 235, cough: 175, headache: 145 },
  { date: 'Sat', fever: 245, cough: 189, headache: 156 },
  { date: 'Sun', fever: 240, cough: 185, headache: 150 },
];

// Symptom distribution data
const SYMPTOM_DISTRIBUTION = [
  { name: 'Fever', value: 245, color: COLORS.high },
  { name: 'Cough', value: 189, color: COLORS.medium },
  { name: 'Headache', value: 156, color: COLORS.accent },
  { name: 'Body Pain', value: 98, color: COLORS.primaryLight },
  { name: 'Fatigue', value: 87, color: COLORS.primary },
];

export default function SentinelMap({ hotspots, dateRange }: SentinelMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const displayHotspots = hotspots || MOCK_HOTSPOTS;

  // Calculate severity statistics
  const severityStats = useMemo(() => {
    const stats = { high: 0, medium: 0, low: 0 };
    displayHotspots.forEach(hotspot => {
      stats[hotspot.severity]++;
    });
    return stats;
  }, [displayHotspots]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return COLORS.primary;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: COLORS.background }}>
      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
              🏥 Sentinel Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time Public Health Surveillance - Anonymized Symptom Monitoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Last 7 Days</span>
          </div>
        </div>
      </div>

      {/* Severity Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: COLORS.high }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.high }}>
                {severityStats.high}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{ color: COLORS.high }} />
          </div>
        </div>

        <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: COLORS.medium }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medium Severity</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.medium }}>
                {severityStats.medium}
              </p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: COLORS.medium }} />
          </div>
        </div>

        <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: COLORS.low }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Severity</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.low }}>
                {severityStats.low}
              </p>
            </div>
            <MapPin className="w-8 h-8" style={{ color: COLORS.low }} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Line Chart */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>
            📈 Symptom Trends (7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOCK_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke={COLORS.primary} />
              <YAxis stroke={COLORS.primary} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(240, 244, 241, 0.95)',
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="fever" 
                stroke={COLORS.high} 
                strokeWidth={2}
                name="Fever"
              />
              <Line 
                type="monotone" 
                dataKey="cough" 
                stroke={COLORS.medium} 
                strokeWidth={2}
                name="Cough"
              />
              <Line 
                type="monotone" 
                dataKey="headache" 
                stroke={COLORS.accent} 
                strokeWidth={2}
                name="Headache"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Symptom Distribution Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>
            🎯 Symptom Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={SYMPTOM_DISTRIBUTION}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {SYMPTOM_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Hotspots Bar Chart */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>
          🗺️ Regional Symptom Hotspots
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={displayHotspots}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="region" stroke={COLORS.primary} />
            <YAxis stroke={COLORS.primary} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(240, 244, 241, 0.95)',
                border: `1px solid ${COLORS.primary}`,
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill={COLORS.primary}
              name="Symptom Reports"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hotspot Details Table */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>
          📊 Detailed Hotspot Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: COLORS.primary }}>
                <th className="text-left p-3 font-semibold" style={{ color: COLORS.primary }}>
                  Region
                </th>
                <th className="text-left p-3 font-semibold" style={{ color: COLORS.primary }}>
                  Pincode
                </th>
                <th className="text-left p-3 font-semibold" style={{ color: COLORS.primary }}>
                  Symptom Type
                </th>
                <th className="text-left p-3 font-semibold" style={{ color: COLORS.primary }}>
                  Count
                </th>
                <th className="text-left p-3 font-semibold" style={{ color: COLORS.primary }}>
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {displayHotspots.map((hotspot, index) => (
                <tr 
                  key={index}
                  className="border-b hover:bg-opacity-50 cursor-pointer transition-colors"
                  style={{ 
                    borderColor: '#e0e0e0',
                    backgroundColor: selectedRegion === hotspot.region ? 'rgba(45, 90, 39, 0.1)' : 'transparent'
                  }}
                  onClick={() => setSelectedRegion(hotspot.region)}
                >
                  <td className="p-3">{hotspot.region}</td>
                  <td className="p-3 text-gray-600">{hotspot.pincode}</td>
                  <td className="p-3">{hotspot.symptomType}</td>
                  <td className="p-3 font-semibold">{hotspot.count}</td>
                  <td className="p-3">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: getSeverityColor(hotspot.severity) }}
                    >
                      {hotspot.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="glass-card p-4 mt-6 border-l-4" style={{ borderLeftColor: COLORS.accent }}>
        <p className="text-sm text-gray-600">
          🔒 <strong>Privacy Notice:</strong> All data displayed is anonymized and aggregated in compliance with 
          the Digital Personal Data Protection (DPDP) Act 2023. No personally identifiable information (PII) 
          is stored or displayed. Data is used solely for public health surveillance and outbreak detection.
        </p>
      </div>
    </div>
  );
}
