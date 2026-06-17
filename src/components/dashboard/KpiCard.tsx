'use client';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  subtitle?: string;
  accent?: 'gold' | 'green' | 'gray';
}

const ACCENT_COLORS = {
  gold: 'border-l-accent',
  green: 'border-l-positive',
  gray: 'border-l-ink-muted',
};

export default function KpiCard({ label, value, delta, subtitle, accent = 'gold' }: KpiCardProps) {
  return (
    <div
      className={`bg-bg-elevated border border-border p-5 border-l-[3px] ${ACCENT_COLORS[accent]}`}
      style={{ borderRadius: 0 }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-2">{label}</p>
      <p className="font-display text-3xl font-bold text-ink leading-none">{value}</p>
      {delta && <p className="text-sm text-positive mt-1">{delta}</p>}
      {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
    </div>
  );
}
