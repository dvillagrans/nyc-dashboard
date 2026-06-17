import { create } from 'zustand';

export type TabId =
  | 'summary'
  | 'peak-hours'
  | 'maps'
  | 'uber-vs-lyft'
  | 'income'
  | 'airports'
  | 'ml-models';

interface DashboardState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'summary',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
