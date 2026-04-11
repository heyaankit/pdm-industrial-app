'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Cog,
  AlertTriangle,
  Activity,
  CheckCircle,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiClient } from '@/lib/api';
import { Pump, PumpPredictionLog } from '@/lib/types';
import StatCard from '@/components/StatCard';
import { formatDate, statusColor, maintenanceColor } from '@/lib/utils';

const STATUS_COLORS = {
  'Operational': '#10b981',
  'Under Maintenance': '#f59e0b',
  'Decommissioned': '#ef4444',
};

const MAINTENANCE_COLORS = ['#ef4444', '#10b981'];

export default function DashboardPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [allLogs, setAllLogs] = useState<PumpPredictionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const pumpData = await apiClient.listPumps();
      setPumps(pumpData);

      const logs = await apiClient.getAllPredictionLogs();
      logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <p className="text-xs text-slate-400">
            Make sure the FastAPI backend is running at{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-brand-600">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
        </div>
      </div>
    );
  }

  const totalPumps = pumps.length;
  const operational = pumps.filter((p) => p.status === 'Operational').length;
  const underMaintenance = pumps.filter((p) => p.status === 'Under Maintenance').length;
  const decommissioned = pumps.filter((p) => p.status === 'Decommissioned').length;
  const maintenanceAlerts = allLogs.filter((l) => l.maintenance_required === 'Yes').length;
  const recentLogs = allLogs.slice(0, 50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Overview of your industrial asset fleet and maintenance predictions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Pumps"
          value={totalPumps}
          subtitle="Registered assets"
          icon={<Cog className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Operational"
          value={operational}
          subtitle={`${totalPumps > 0 ? ((operational / totalPumps) * 100).toFixed(0) : 0}% of fleet`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Under Maintenance"
          value={underMaintenance}
          subtitle="Requires attention"
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Maintenance Alerts"
          value={maintenanceAlerts}
          subtitle="From predictions"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Status Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Fleet Status Overview</h2>
            <Link
              href="/pumps"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {totalPumps > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Operational', value: operational },
                          { name: 'Under Maintenance', value: underMaintenance },
                          { name: 'Decommissioned', value: decommissioned },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {Object.keys(STATUS_COLORS).map((status) => (
                          <Cell key={status} fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {[
                    { status: 'Operational', count: operational, color: STATUS_COLORS['Operational'], desc: 'Running normally' },
                    { status: 'Under Maintenance', count: underMaintenance, color: STATUS_COLORS['Under Maintenance'], desc: 'Needs attention' },
                    { status: 'Decommissioned', count: decommissioned, color: STATUS_COLORS['Decommissioned'], desc: 'No longer active' },
                  ].map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.status}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Cog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pumps registered yet</p>
                <Link
                  href="/pumps/create"
                  className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Add your first pump
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/pumps/create"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors group"
            >
              <Cog className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Register New Pump</p>
                <p className="text-xs opacity-70">Add an asset to the system</p>
              </div>
            </Link>
            <Link
              href="/predictions"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors group"
            >
              <Activity className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Run Prediction</p>
                <p className="text-xs opacity-70">Submit sensor data for analysis</p>
              </div>
            </Link>
            <Link
              href="/pumps"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors group"
            >
              <Wrench className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Manage Pumps</p>
                <p className="text-xs opacity-70">View and update pump statuses</p>
              </div>
            </Link>
            <Link
              href="/prediction-logs"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors group"
            >
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">View Alerts</p>
                <p className="text-xs opacity-70">Check maintenance predictions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Prediction Trend by Pump */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Maintenance Alerts by Pump</h2>
          <Link
            href="/prediction-logs"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          {allLogs.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    const pumpData: Record<number, { name: string; maintenance: number; total: number }> = {};
                    allLogs.forEach((log) => {
                      if (!pumpData[log.pump_id]) {
                        pumpData[log.pump_id] = { name: `Pump ${log.pump_id}`, maintenance: 0, total: 0 };
                      }
                      pumpData[log.pump_id].total += 1;
                      if (log.maintenance_required === 'Yes') {
                        pumpData[log.pump_id].maintenance += 1;
                      }
                    });
                    return Object.values(pumpData)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => ({
                        name: p.name,
                        alerts: p.maintenance,
                        rate: Math.round((p.maintenance / p.total) * 100),
                      }));
                  })()}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="alerts" name="Maintenance Alerts" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="rate" name="Alert Rate %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No prediction data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
