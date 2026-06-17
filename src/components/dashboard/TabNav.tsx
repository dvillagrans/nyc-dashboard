'use client';

import { useDashboardStore, type TabId } from '@/stores/dashboard';

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Resumen General' },
  { id: 'peak-hours', label: 'Horas Pico' },
  { id: 'maps', label: 'Mapas' },
  { id: 'uber-vs-lyft', label: 'Uber vs Lyft' },
  { id: 'income', label: 'Ingresos' },
  { id: 'airports', label: 'Aeropuertos' },
  { id: 'ml-models', label: 'Modelos ML' },
];

export default function TabNav() {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  return (
    <nav className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-4 py-3 text-sm font-mono uppercase tracking-[0.1em] whitespace-nowrap
            transition-colors border-b-2 -mb-[1px]
            ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-border-rule'
            }
          `}
          style={{ borderRadius: 0, background: 'transparent' }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
