'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Cog,
  MapPin,
  Calendar,
  Thermometer,
  Activity,
  Gauge,
  Droplets,
  RotateCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Pump, PumpStatus } from '@/lib/types';
import { formatDate, statusColor, maintenanceColor, confidenceColor } from '@/lib/utils';
import { useToast, Toast } from '@/components/Toast';
import Modal from '@/components/Modal';

const statusOptions: PumpStatus[] = ['Operational', 'Under Maintenance', 'Decommissioned'];

export default function PumpDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [pump, setPump] = useState<Pump | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PumpStatus | ''>('');
  const [updating, setUpdating] = useState(false);

  const pumpId = Number(params.id);

  useEffect(() => {
    if (pumpId) loadPump();
  }, [pumpId]);

  async function loadPump() {
    try {
      const [pumpData, logsData] = await Promise.all([
        apiClient.getPump(pumpId),
        apiClient.getPumpPredictionLogs(pumpId)
      ]);
      setPump({ ...pumpData, prediction_log: logsData });
    } catch (err) {
      showToast('Failed to load pump details', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selectedStatus) return;
    try {
      setUpdating(true);
      await apiClient.updatePumpStatus(pumpId, selectedStatus);
      showToast(`Status updated to "${selectedStatus}"`, 'success');
      setStatusModalOpen(false);
      loadPump();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pump) {
    return (
      <div className="text-center py-16">
        <Cog className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-slate-700">Pump not found</h2>
        <Link href="/pumps" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          Back to Pumps
        </Link>
      </div>
    );
  }

  const logs = pump.prediction_log || [];
  const maintenanceAlerts = logs.filter((l) => l.maintenance_required === 'Yes');
  const avgConfidence = logs.length > 0
    ? logs.reduce((sum, l) => sum + l.confidence_score, 0) / logs.length
    : 0;

  return (
    <>
      {ToastComponent}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Pump Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Select the new status for <span className="font-medium text-slate-700">{pump.name}</span>
          </p>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label
                key={status}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                  selectedStatus === status
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={(e) => setSelectedStatus(e.target.value as PumpStatus)}
                  className="accent-brand-600"
                />
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColor(status)}`}>
                  {status}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || updating}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-brand-400 flex items-center gap-2"
            >
              {updating && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      <div className="space-y-6">
        {/* Back nav */}
        <Link
          href="/pumps"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pumps
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-50">
              <Cog className="w-7 h-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{pump.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" /> {pump.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(pump.installation_date)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full border ${statusColor(pump.status)}`}>
              {pump.status}
            </span>
            <button
              onClick={() => {
                setSelectedStatus(pump.status);
                setStatusModalOpen(true);
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update Status
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Total Predictions</p>
            <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Maintenance Alerts</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-red-600">{maintenanceAlerts.length}</p>
              {maintenanceAlerts.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              {maintenanceAlerts.length === 0 && (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Avg Confidence</p>
            <p className={`text-2xl font-bold ${confidenceColor(avgConfidence)}`}>
              {logs.length > 0 ? `${(avgConfidence * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Prediction History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Sensor Data & Prediction History</h2>
            <Link
              href={`/predictions?pump_id=${pumpId}`}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Run New Prediction
            </Link>
          </div>
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Temp</th>
                    <th className="text-left px-6 py-3 font-medium">Vibration</th>
                    <th className="text-left px-6 py-3 font-medium">Pressure</th>
                    <th className="text-left px-6 py-3 font-medium">Flow Rate</th>
                    <th className="text-left px-6 py-3 font-medium">RPM</th>
                    <th className="text-left px-6 py-3 font-medium">Op. Hours</th>
                    <th className="text-left px-6 py-3 font-medium">Maintenance</th>
                    <th className="text-left px-6 py-3 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-xs text-slate-400">{formatDate(log.created_at)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No prediction data yet for this pump</p>
              <Link
                href={`/predictions?pump_id=${pumpId}`}
                className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Run first prediction
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
