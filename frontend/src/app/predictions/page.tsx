'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  Thermometer,
  Gauge,
  Wind,
  RotateCw,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
  Cog,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Pump, PredictionLogCreateRequest, PredictionResponse } from '@/lib/types';
import { useToast, Toast } from '@/components/Toast';

interface SensorField {
  key: keyof PredictionLogCreateRequest;
  label: string;
  icon: React.ReactNode;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  step: number;
}

const sensorFields: Omit<SensorField, 'key'>[] = [
  { label: 'Temperature', icon: <Thermometer className="w-4 h-4" />, unit: '\u00B0C', placeholder: 'e.g., 75', min: 0, max: 200, step: 0.1 },
  { label: 'Vibration', icon: <Activity className="w-4 h-4" />, unit: 'mm/s', placeholder: 'e.g., 2.5', min: 0, max: 100, step: 0.01 },
  { label: 'Pressure', icon: <Gauge className="w-4 h-4" />, unit: 'bar', placeholder: 'e.g., 4.5', min: 0, max: 50, step: 0.1 },
  { label: 'Flow Rate', icon: <Wind className="w-4 h-4" />, unit: 'L/s', placeholder: 'e.g., 25', min: 0, max: 500, step: 0.1 },
  { label: 'RPM', icon: <RotateCw className="w-4 h-4" />, unit: 'rpm', placeholder: 'e.g., 3000', min: 0, max: 10000, step: 1 },
  { label: 'Operational Hours', icon: <Clock className="w-4 h-4" />, unit: 'hours', placeholder: 'e.g., 5000', min: 0, max: 100000, step: 1 },
];

const sensorKeys = ['temperature', 'vibration', 'pressure', 'flow_rate', 'rpm', 'operational_hours'];

function PredictionsForm() {
  const searchParams = useSearchParams();
  const { showToast, ToastComponent } = useToast();

  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<number | ''>('');
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    apiClient.listPumps().then(setPumps).catch(() => {});
    const preselected = searchParams.get('pump_id');
    if (preselected) setSelectedPumpId(Number(preselected));
  }, [searchParams]);

  function handleSensorChange(key: string, value: string) {
    setSensorValues((prev) => ({ ...prev, [key]: value }));
  }

  function isValid(): boolean {
    if (!selectedPumpId) return false;
    return sensorKeys.every((key) => sensorValues[key] !== undefined && sensorValues[key] !== '');
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid() || !selectedPumpId) return;

    const payload: PredictionLogCreateRequest = {
      pump_id: Number(selectedPumpId),
      temperature: parseFloat(sensorValues.temperature || '0'),
      vibration: parseFloat(sensorValues.vibration || '0'),
      pressure: parseFloat(sensorValues.pressure || '0'),
      flow_rate: parseFloat(sensorValues.flow_rate || '0'),
      rpm: parseFloat(sensorValues.rpm || '0'),
      operational_hours: parseFloat(sensorValues.operational_hours || '0'),
    };

    try {
      setPredicting(true);
      setResult(null);
      const prediction = await apiClient.predictMaintenance(payload);
      setResult(prediction);
      showToast('Prediction completed successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Prediction failed', 'error');
    } finally {
      setPredicting(false);
    }
  }

  const selectedPump = pumps.find((p) => p.id === selectedPumpId);

  return (
    <>
      {ToastComponent}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Prediction</h1>
          <p className="text-slate-500 mt-1">
            Submit real-time sensor data to predict if maintenance is required using the ML model
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handlePredict} className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-500" />
                  Input Sensor Data
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Pump Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Select Pump <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Cog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedPumpId}
                      onChange={(e) => setSelectedPumpId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white appearance-none"
                      required
                    >
                      <option value="">Choose a pump...</option>
                      {pumps.map((pump) => (
                        <option key={pump.id} value={pump.id}>
                          #{pump.id} - {pump.name} ({pump.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  {pumps.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No pumps available. Please add a pump first.</p>
                  )}
                </div>

                {/* Sensor Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sensorKeys.map((key, idx) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          {sensorFields[idx].icon}
                          {sensorFields[idx].label} <span className="text-slate-400 font-normal">({sensorFields[idx].unit})</span>
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        value={sensorValues[key] || ''}
                        onChange={(e) => handleSensorChange(key, e.target.value)}
                        placeholder={sensorFields[idx].placeholder}
                        min={sensorFields[idx].min}
                        max={sensorFields[idx].max}
                        step={sensorFields[idx].step}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={!isValid() || predicting || pumps.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  {predicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Run Prediction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Prediction Result</h2>
              </div>
              <div className="p-6">
                {result ? (
                  <div className="space-y-4">
                    {/* Maintenance Status */}
                    <div className={`p-4 rounded-xl border-2 ${
                      result.maintenance_required === 'Yes'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {result.maintenance_required === 'Yes' ? (
                          <AlertTriangle className="w-8 h-8 text-red-500" />
                        ) : (
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                        )}
                        <div>
                          <p className={`text-lg font-bold ${
                            result.maintenance_required === 'Yes' ? 'text-red-700' : 'text-emerald-700'
                          }`}>
                            {result.maintenance_required === 'Yes' ? 'Maintenance Required' : 'No Maintenance Needed'}
                          </p>
                          <p className="text-sm text-slate-500">Based on ML model analysis</p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 font-medium mb-2">Confidence Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              result.confidence_score >= 0.8
                                ? 'bg-emerald-500'
                                : result.confidence_score >= 0.6
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${result.confidence_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-slate-800">
                          {(result.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Pump info */}
                    {selectedPump && (
                      <div className="text-sm text-slate-500">
                        <p>
                          Analyzed: <span className="font-medium text-slate-700">{selectedPump.name}</span> at{' '}
                          <span className="font-medium text-slate-700">{selectedPump.location}</span>
                        </p>
                      </div>
                    )}

                    {/* Factor Details */}
                    {result.details?.factor_details && Object.keys(result.details.factor_details).length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-2">Problematic Factors</p>
                        <div className="space-y-2">
                          {Object.entries(result.details.factor_details).map(([key, factor]: [string, any]) => (
                            <div key={key} className={`p-3 rounded-lg border ${
                              factor.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-700 capitalize">{key.replace('_', ' ')}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  factor.status === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                  {factor.status}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-slate-600">
                                <span className="font-medium">Value:</span> {factor.value.toFixed(2)} (threshold: {factor.threshold.toFixed(2)})
                              </div>
                              <div className="text-xs text-slate-500 mt-1">{factor.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score Breakdown */}
                    {result.details?.score_breakdown && Object.keys(result.details.score_breakdown).length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-2">Score Breakdown</p>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                          {Object.entries(result.details.score_breakdown).map(([key, score]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="capitalize text-slate-600">{key}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-medium ${
                                  score.triggered ? 'text-red-600' : 'text-slate-400'
                                }`}>
                                  {score.score}/{score.threshold}
                                </span>
                                {score.triggered && (
                                  <span className="text-red-500 text-xs">!</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Submit sensor data to see prediction results</p>
                    <p className="text-xs text-slate-400 mt-1">
                      The ML model analyzes vibration, temperature, pressure, and more
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PredictionsForm />
    </Suspense>
  );
}
