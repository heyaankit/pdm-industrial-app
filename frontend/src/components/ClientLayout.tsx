'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useToast, Toast } from './Toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const toastCtx = useToast();

  // Re-initialize toast on route change to keep it stable
  const [key, setKey] = React.useState(0);
  React.useEffect(() => {
    setKey((k) => k + 1);
  }, [pathname]);

  return (
    <>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen bg-slate-50">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
      {toastCtx.ToastComponent}
    </>
  );
}
