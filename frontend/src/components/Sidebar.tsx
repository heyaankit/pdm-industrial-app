'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cog,
  Activity,
  FileText,
  Menu,
  X,
  Factory,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pumps', label: 'Pumps', icon: Cog },
  { href: '/predictions', label: 'Predictions', icon: Activity },
  { href: '/prediction-logs', label: 'Prediction Logs', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
          <Factory className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">PDM System</h1>
          <p className="text-xs text-slate-400">Predictive Maintenance</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-brand-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">PDM Industrial App v1.0</p>
        <p className="text-xs text-slate-600 mt-1">FastAPI Backend</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-64 bg-slate-800 z-50 transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700/50 shadow-xl">
        <NavContent />
      </aside>
    </>
  );
}
