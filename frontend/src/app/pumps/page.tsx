'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Cog, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Pump } from '@/lib/types';
import { statusColor, formatDate } from '@/lib/utils';

export default function PumpsListPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [pumpLogs, setPumpLogs] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPumps();
  }, []);

  async function loadPumps() {
    try {
      const data = await apiClient.listPumps();
      setPumps(data);

      const logsMap: Record<number, number> = {};
      for (const pump of data) {
        const logs = await apiClient.getPumpPredictionLogs(pump.id);
        const yesCount = logs.filter((l) => l.maintenance_required === 'Yes').length;
        if (yesCount > 0) {
          logsMap[pump.id] = yesCount;
        }
      }
      setPumpLogs(logsMap);
    } catch (err) {
      console.error('Failed to load pumps:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPumps = pumps.filter((pump) => {
    const matchesSearch =
      pump.name.toLowerCase().includes(search.toLowerCase()) ||
      pump.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pump.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pumps Management</h1>
          <p className="text-slate-500 mt-1">
            Manage your industrial pump assets ({pumps.length} total)
          </p>
        </div>
        <Link
          href="/pumps/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Pump
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
        </div>
      </div>

      {/* Pumps Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPumps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Cog className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No pumps found</h3>
          <p className="text-sm text-slate-400 mb-4">
            {pumps.length === 0
              ? 'Get started by registering your first pump.'
              : 'Try adjusting your search or filter.'}
          </p>
          {pumps.length === 0 && (
            <Link
              href="/pumps/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Pump
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPumps.map((pump) => (
            <Link
              key={pump.id}
              href={`/pumps/${pump.id}`}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-brand-100 transition-colors">
                  <Cog className="w-5 h-5 text-slate-500 group-hover:text-brand-600 transition-colors" />
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor(pump.status)}`}
                >
                  {pump.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                {pump.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{pump.location}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>ID: #{pump.id}</span>
                <span>Installed: {formatDate(pump.installation_date)}</span>
              </div>
              {pumpLogs[pump.id] && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {pumpLogs[pump.id]} maintenance alert(s)
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
