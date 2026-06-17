'use client';

import { useEffect, useState } from 'react';
import { loadSummary, type SummaryData } from '@/lib/data';
import { formatNumber, formatMoney, formatMiles, formatDuration } from '@/lib/formatters';
import { OPERATOR_COLORS, BOROUGH_COLORS } from '@/lib/constants';
import KpiCard from '@/components/dashboard/KpiCard';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

export default function SummaryTab() {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    loadSummary().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando resumen...</div>;

  const hours = [...new Set(data.byHour.map((d) => d.pickup_hour))].sort((a, b) => a - b);
  const operators = [...new Set(data.byHour.map((d) => d.operator))];

  const byHourOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: operators },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hours.map((h) => `${h}:00`) },
    yAxis: { type: 'value', name: 'Viajes' },
    series: operators.map((op) => ({
      name: op,
      type: 'bar' as const,
      stack: 'total',
      data: hours.map((h) => {
        const row = data.byHour.find((d) => d.pickup_hour === h && d.operator === op);
        return row?.trips ?? 0;
      }),
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const byWeekdayOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: operators },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', name: 'Viajes' },
    series: operators.map((op) => ({
      name: op,
      type: 'bar' as const,
      stack: 'total',
      data: days.map((d) => {
        const row = data.byWeekday.find((r) => r.day_name === d && r.operator === op);
        return row?.trips ?? 0;
      }),
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  const heatmapOption: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] };
        const [x, y, val] = p.value;
        return `${days[y]} ${hours[x]}:00 — ${formatNumber(val)} viajes`;
      },
    },
    grid: { left: 80, right: 40, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: hours.map((h) => `${h}h`), splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: Math.max(...data.heatmap.map((d) => d[2]), 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#0e0e11', '#1a3a2a', '#2d9d78', '#e8b923'] },
      textStyle: { color: '#6b6b6f' },
    },
    series: [
      {
        type: 'heatmap',
        data: data.heatmap,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      },
    ],
  };

  const dailyMap = new Map<string, number>();
  for (const row of data.dailyTrend) {
    dailyMap.set(row.pickup_date, (dailyMap.get(row.pickup_date) ?? 0) + row.trips);
  }
  const dailyDates = [...dailyMap.keys()].sort();
  const dailyValues = dailyDates.map((d) => dailyMap.get(d) ?? 0);

  const dailyTrendOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: dailyDates, axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', name: 'Viajes' },
    series: [
      {
        type: 'line',
        data: dailyValues,
        smooth: true,
        lineStyle: { color: '#e8b923', width: 2 },
        itemStyle: { color: '#e8b923' },
        areaStyle: { color: 'rgba(232,185,35,0.08)' },
      },
    ],
  };

  const boroughOption: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.boroughDistribution.map((d) => ({
          name: d.pickup_borough,
          value: d.trips,
          itemStyle: { color: BOROUGH_COLORS[d.pickup_borough] ?? '#6b6b6f' },
        })),
        label: { color: '#e8e6e3' },
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Viajes" value={formatNumber(data.kpis.totalTrips)} accent="gold" />
        <KpiCard label="Días Únicos" value={formatNumber(data.kpis.uniqueDays)} accent="gray" />
        <KpiCard label="Operadores" value={formatNumber(data.kpis.operators)} accent="gray" />
        <KpiCard label="Ingresos Totales" value={formatMoney(data.kpis.totalIncome)} accent="green" />
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Promedio Diario" value={formatNumber(Math.round(data.kpis.avgDailyTrips))} subtitle="viajes/día" accent="gold" />
        <KpiCard label="Distancia Promedio" value={formatMiles(data.kpis.avgMiles)} accent="gray" />
        <KpiCard label="Duración Promedio" value={formatDuration(data.kpis.avgTimeMin)} accent="gray" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Viajes por Hora</h3>
          <EChart option={byHourOption} height={320} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Viajes por Día</h3>
          <EChart option={byWeekdayOption} height={320} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Heatmap: Hora × Día</h3>
        <EChart option={heatmapOption} height={350} />
      </div>

      {/* Daily Trend */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Tendencia Diaria</h3>
        <EChart option={dailyTrendOption} height={300} />
      </div>

      {/* Operator Table + Borough Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Resumen por Operador</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-rule text-ink-muted font-mono text-[10px] uppercase tracking-[0.15em]">
                  <th className="text-left py-2 px-2">Operador</th>
                  <th className="text-right py-2 px-2">Viajes</th>
                  <th className="text-right py-2 px-2">Ingresos</th>
                  <th className="text-right py-2 px-2">Propinas</th>
                  <th className="text-right py-2 px-2">Dist.</th>
                </tr>
              </thead>
              <tbody>
                {data.operatorSummary.map((op) => (
                  <tr key={op.operator} className="border-b border-border">
                    <td className="py-2 px-2 font-medium" style={{ color: OPERATOR_COLORS[op.operator] ?? '#e8e6e3' }}>{op.operator}</td>
                    <td className="text-right py-2 px-2">{formatNumber(op.trips)}</td>
                    <td className="text-right py-2 px-2">{formatMoney(op.income)}</td>
                    <td className="text-right py-2 px-2">{formatMoney(op.tips)}</td>
                    <td className="text-right py-2 px-2">{formatMiles(op.avg_miles)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución por Borough</h3>
          <EChart option={boroughOption} height={350} />
        </div>
      </div>
    </div>
  );
}
