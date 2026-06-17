'use client';

import { Suspense } from 'react';
import { useDashboardStore } from '@/stores/dashboard';
import Header from '@/components/dashboard/Header';
import TabNav from '@/components/dashboard/TabNav';
import SummaryTab from '@/components/dashboard/tabs/SummaryTab';
import PeakHoursTab from '@/components/dashboard/tabs/PeakHoursTab';
import MapsTab from '@/components/dashboard/tabs/MapsTab';
import UberVsLyftTab from '@/components/dashboard/tabs/UberVsLyftTab';
import IncomeTab from '@/components/dashboard/tabs/IncomeTab';
import AirportsTab from '@/components/dashboard/tabs/AirportsTab';
import MlModelsTab from '@/components/dashboard/tabs/MlModelsTab';

function TabContent() {
  const activeTab = useDashboardStore((s) => s.activeTab);

  switch (activeTab) {
    case 'summary':
      return <SummaryTab />;
    case 'peak-hours':
      return <PeakHoursTab />;
    case 'maps':
      return <MapsTab />;
    case 'uber-vs-lyft':
      return <UberVsLyftTab />;
    case 'income':
      return <IncomeTab />;
    case 'airports':
      return <AirportsTab />;
    case 'ml-models':
      return <MlModelsTab />;
    default:
      return <SummaryTab />;
  }
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent animate-spin mb-4" style={{ borderRadius: 0 }} />
        <p className="font-mono text-sm text-ink-muted uppercase tracking-[0.2em]">Cargando datos...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg p-6 md:p-10 max-w-[1400px] mx-auto">
      <Header />
      <TabNav />
      <Suspense fallback={<LoadingFallback />}>
        <TabContent />
      </Suspense>
    </main>
  );
}
