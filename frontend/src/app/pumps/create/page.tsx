'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useToast, Toast } from '@/components/Toast';

export default function CreatePumpPage() {
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !location.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const pump = await apiClient.createPump({ name: name.trim(), location: location.trim() });
      showToast(`Pump "${pump.name}" created successfully!`, 'success');
      router.push(`/pumps/${pump.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create pump', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/pumps"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pumps
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Register New Pump</h1>
          <p className="text-slate-500 mt-1">Add a new industrial pump asset to the system</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Pump Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Cooling Pump A"
                  maxLength={50}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{name.length}/50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Building A, Floor 2"
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{location.length}/100 characters</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200">
            <Link
              href="/pumps"
              className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Pump
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
