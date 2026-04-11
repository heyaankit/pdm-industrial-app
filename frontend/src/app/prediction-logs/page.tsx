'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, AlertTriangle, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Pump, PumpPredictionLog } from '@/lib/types';
import { formatDate, maintenanceColor, confidenceColor } from '@/lib/utils';

export default function PredictionLogsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [allLogs, setAllLogs] = useState<(PumpPredictionLog & { pump_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const pumpData = await apiClient.listPumps();
      setPumps(pumpData);

      const logs = await apiClient.getAllPredictionLogs();
      const logsWithPumpName = logs.map((log) => {
        const pump = pumpData.find((p) => p.id === log.pump_id);
        return { ...log, pump_name: pump?.name || `Pump ${log.pump_id}` };
      });
      setAllLogs(logsWithPumpName);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      String(log.pump_id).includes(search) ||
      (log.pump_name && log.pump_name.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filter === 'all' ||
      (filter === 'yes' && log.maintenance_required === 'Yes') ||
      (filter === 'no' && log.maintenance_required === 'No');
    return matchesSearch && matchesFilter;
  });

  const totalAlerts = allLogs.filter((l) => l.maintenance_required === 'Yes').length;
  const avgConfidence = allLogs.length > 0
    ? allLogs.reduce((sum, l) => sum + l.confidence_score, 0) / allLogs.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Prediction Logs</h1>
        <p className="text-slate-500 mt-1">
          Review all maintenance predictions and sensor readings history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Predictions</p>
          <p className="text-2xl font-bold text-slate-800">{allLogs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Maintenance Alerts
          </p>
          <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Average Confidence</p>
          <p className={`text-2xl font-bold ${confidenceColor(avgConfidence)}`}>
            {allLogs.length > 0 ? `${(avgConfidence * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by pump ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(['all', 'yes', 'no'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    filter === value
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {value === 'all' ? 'All' : value === 'yes' ? 'Maintenance Required' : 'No Maintenance'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No prediction logs found</h3>
          <p className="text-sm text-slate-400 mb-4">
            {allLogs.length === 0
              ? 'Run your first prediction to see logs here.'
              : 'Try adjusting your filters.'}
          </p>
          {allLogs.length === 0 && (
            <Link
              href="/predictions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Run Prediction
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 font-medium">Log ID</th>
                  <th className="text-left px-6 py-3 font-medium">Pump</th>
                  <th className="text-left px-6 py-3 font-medium">Temperature</th>
                  <th className="text-left px-6 py-3 font-medium">Vibration</th>
                  <th className="text-left px-6 py-3 font-medium">Pressure</th>
                  <th className="text-left px-6 py-3 font-medium">Flow Rate</th>
                  <th className="text-left px-6 py-3 font-medium">RPM</th>
                  <th className="text-left px-6 py-3 font-medium">Op. Hours</th>
                  <th className="text-left px-6 py-3 font-medium">Maintenance</th>
                  <th className="text-left px-6 py-3 font-medium">Confidence</th>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400">#{log.id}</td>
                    <td className="px-6 py-3 text-sm">
                      <Link
                        href={`/pumps/${log.pump_id}`}
                        className="text-brand-600 hover:underline font-medium"
                      >
                        {log.pump_name || `Pump #${log.pump_id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.temperature.toFixed(1)}&deg;C</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.vibration.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.pressure.toFixed(1)} bar</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.flow_rate.toFixed(1)} L/s</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.rpm.toFixed(0)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{log.operational_hours.toFixed(0)}h</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${maintenanceColor(log.maintenance_required)}`}>
                        {log.maintenance_required}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{(log.confidence_score * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            Showing {filteredLogs.length} of {allLogs.length} log(s)
          </div>
        </div>
      )}
    </div>
  );
}
