'use client';

import { useEffect, useState } from 'react';
import { loadIncome, type IncomeData } from '@/lib/data';
import { formatMoney, formatNumber } from '@/lib/formatters';
import { OPERATOR_COLORS } from '@/lib/constants';
import KpiCard from '@/components/dashboard/KpiCard';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

export default function IncomeTab() {
  const [data, setData] = useState<IncomeData | null>(null);

  useEffect(() => {
    loadIncome().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando ingresos...</div>;

  // Metric cards for each income type
  const incomeTypes = Object.entries(data.totals);

  // Donut chart (composition)
  const donutOption: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.composition.map((d) => ({
          name: d.name,
          value: d.value,
        })),
        label: { color: '#e8e6e3' },
      },
    ],
  };

  // Stacked bar by company
  const byCompanyOps = data.byCompany.map((d) => String(d.operator ?? d.company ?? ''));
  const byCompanyKeys = data.byCompany.length > 0 ? Object.keys(data.byCompany[0]).filter((k) => k !== 'operator' && k !== 'company') : [];
  const stackedBarOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: byCompanyKeys },
    grid: { left: 120, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'value', name: 'Monto ($)' },
    yAxis: { type: 'category', data: byCompanyOps },
    series: byCompanyKeys.map((key, i) => ({
      name: key,
      type: 'bar' as const,
      stack: 'total',
      data: data.byCompany.map((d) => Number(d[key] ?? 0)),
      itemStyle: { color: ['#e8b923', '#2d9d78', '#276EF1', '#FF00BF', '#FF9800'][i % 5] },
    })),
  };

  // Daily trend line
  const operators = [...new Set(data.dailyTrend.map((d) => d.operator))];
  const dailyDates = [...new Set(data.dailyTrend.map((d) => d.date))].sort();
  const dailyTrendOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: operators },
    grid: { left: 80, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: dailyDates, axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', name: 'Ingresos ($)' },
    series: operators.map((op) => ({
      name: op,
      type: 'line' as const,
      smooth: true,
      data: dailyDates.map((d) => {
        const row = data.dailyTrend.find((r) => r.date === d && r.operator === op);
        return row?.income ?? 0;
      }),
      lineStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Scatter plot (fare vs tips)
  const scatterOps = [...new Set(data.scatter.map((d) => d.operator))];
  const scatterOption: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { value: [number, number]; seriesName: string };
        return `${p.seriesName}<br/>Tarifa: ${formatMoney(p.value[0])}<br/>Propina: ${formatMoney(p.value[1])}`;
      },
    },
    legend: { data: scatterOps },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'value', name: 'Tarifa ($)', axisLabel: { formatter: (v: unknown) => `$${v}` } },
    yAxis: { type: 'value', name: 'Propina ($)', axisLabel: { formatter: (v: unknown) => `$${v}` } },
    series: scatterOps.map((op) => ({
      name: op,
      type: 'scatter' as const,
      data: data.scatter.filter((d) => d.operator === op).map((d) => [d.driver_pay, d.tips]),
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f', opacity: 0.5 },
      symbolSize: 4,
    })),
  };

  // Tip % histogram
  const tipOps = [...new Set(data.tipHistogram.map((d) => d.operator))];
  const tipBuckets = [...new Set(data.tipHistogram.map((d) => d.bucket))].sort((a, b) => a - b);
  const tipHistOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: tipOps },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: tipBuckets.map((b) => `${b}%`) },
    yAxis: { type: 'value', name: 'Viajes' },
    series: tipOps.map((op) => ({
      name: op,
      type: 'bar' as const,
      data: tipBuckets.map((b) => {
        const row = data.tipHistogram.find((d) => d.bucket === b && d.operator === op);
        return row?.count ?? 0;
      }),
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {incomeTypes.map(([name, value]) => (
          <KpiCard key={name} label={name} value={formatMoney(value)} accent="green" />
        ))}
      </div>

      {/* Donut + stacked bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Composición de Ingresos</h3>
          <EChart option={donutOption} height={350} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Ingresos por Operador</h3>
          <EChart option={stackedBarOption} height={350} />
        </div>
      </div>

      {/* Daily trend */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Tendencia Diaria de Ingresos</h3>
        <EChart option={dailyTrendOption} height={300} />
      </div>

      {/* Scatter + tip histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Tarifa vs Propinas</h3>
          <EChart option={scatterOption} height={350} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución % Propinas</h3>
          <EChart option={tipHistOption} height={350} />
        </div>
      </div>
    </div>
  );
}
