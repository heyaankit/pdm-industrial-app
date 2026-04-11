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
import { apiClient } from '@/lib/api';
import { Pump, PumpPredictionLog } from '@/lib/types';
import StatCard from '@/components/StatCard';
import { formatDate, statusColor, maintenanceColor } from '@/lib/utils';

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
  const recentLogs = allLogs.slice(0, 10);

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
        {/* Fleet Status */}
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
            {/* Status bar */}
            {totalPumps > 0 ? (
              <div className="mb-6">
                <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${(operational / totalPumps) * 100}%` }}
                  ></div>
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${(underMaintenance / totalPumps) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(decommissioned / totalPumps) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Operational ({operational})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Under Maint. ({underMaintenance})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Decom. ({decommissioned})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-6">No pumps registered yet.</p>
            )}

            {/* Pump list */}
            {pumps.length > 0 ? (
              <div className="space-y-2">
                {pumps.slice(0, 5).map((pump) => (
                  <Link
                    key={pump.id}
                    href={`/pumps/${pump.id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Cog className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">
                          {pump.name}
                        </p>
                        <p className="text-xs text-slate-400">{pump.location}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor(pump.status)}`}
                    >
                      {pump.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Cog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No pumps added yet</p>
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

      {/* Recent Predictions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Recent Predictions</h2>
          <Link
            href="/prediction-logs"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentLogs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left px-6 py-3 font-medium">Pump ID</th>
                  <th className="text-left px-6 py-3 font-medium">Temp</th>
                  <th className="text-left px-6 py-3 font-medium">Vibration</th>
                  <th className="text-left px-6 py-3 font-medium">Pressure</th>
                  <th className="text-left px-6 py-3 font-medium">Maintenance</th>
                  <th className="text-left px-6 py-3 font-medium">Confidence</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-sm">
                      <Link href={`/pumps/${log.pump_id}`} className="text-brand-600 hover:underline font-medium">
                        #{log.pump_id}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.temperature.toFixed(1)} &deg;C</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.vibration.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.pressure.toFixed(1)} bar</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${maintenanceColor(log.maintenance_required)}`}>
                        {log.maintenance_required}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{(log.confidence_score * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-xs text-slate-400">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No predictions run yet</p>
              <Link
                href="/predictions"
                className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Run your first prediction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
