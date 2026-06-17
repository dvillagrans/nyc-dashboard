'use client';

import { useEffect, useState } from 'react';
import { loadUberVsLyft, type UberLyftData } from '@/lib/data';
import { formatNumber, formatMoney, formatMiles, formatDuration, formatPercentage } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

const UBER = CHART_COLORS.uber;
const LYFT = CHART_COLORS.lyft;
const OP_COLORS: Record<string, string> = { Uber: UBER, UBER: UBER, Lyft: LYFT, LYFT: LYFT };

export default function UberVsLyftTab() {
  const [data, setData] = useState<UberLyftData | null>(null);

  useEffect(() => {
    loadUberVsLyft().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando Uber vs Lyft...</div>;
  if (!data.hasData) return <div className="text-ink-muted">No hay datos suficientes para comparar Uber y Lyft.</div>;

  const ops = Object.keys(data.tripDistribution);

  // Trip distribution pie
  const tripPie: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: ops.map((op) => ({
          name: op,
          value: data.tripDistribution[op],
          itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
        })),
        label: { color: '#e8e6e3' },
      },
    ],
  };

  // Income distribution pie
  const incomePie: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: ops.map((op) => ({
          name: op,
          value: data.incomeDistribution[op],
          itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
        })),
        label: { color: '#e8e6e3' },
      },
    ],
  };

  // Tip histogram
  const tipBuckets = [...new Set(data.tipHistogram.map((d) => d.tip_pct_bucket))].sort((a, b) => a - b);
  const tipOperators = [...new Set(data.tipHistogram.map((d) => d.operator))];
  const tipHistOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: tipOperators },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: tipBuckets.map((b) => `${b}%`) },
    yAxis: { type: 'value', name: 'Viajes' },
    series: tipOperators.map((op) => ({
      name: op,
      type: 'bar' as const,
      data: tipBuckets.map((b) => {
        const row = data.tipHistogram.find((d) => d.tip_pct_bucket === b && d.operator === op);
        return row?.count ?? 0;
      }),
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Top zones grouped bar
  const topZoneNames = [...new Set(data.topZonesOperator.map((d) => d.pickup_zone))].slice(0, 15);
  const topZonesOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ops },
    grid: { left: 200, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'value', name: 'Viajes' },
    yAxis: { type: 'category', data: topZoneNames.slice().reverse(), axisLabel: { width: 180, overflow: 'truncate' } },
    series: ops.map((op) => ({
      name: op,
      type: 'bar' as const,
      data: topZoneNames
        .slice()
        .reverse()
        .map((z) => {
          const row = data.topZonesOperator.find((d) => d.pickup_zone === z && d.operator === op);
          return row?.trips ?? 0;
        }),
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Market share heatmap by zone
  const marketZones = [...new Set(data.marketHeatmap.map((d) => d.zone))].slice(0, 20);
  const marketOps = [...new Set(data.marketHeatmap.map((d) => d.operator))];
  const marketHeatmapOption: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] };
        const [x, y, val] = p.value;
        return `${marketOps[y]} — ${marketZones[x]} — ${(val * 100).toFixed(1)}%`;
      },
    },
    grid: { left: 200, right: 40, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: marketZones, axisLabel: { rotate: 45, width: 120, overflow: 'truncate' } },
    yAxis: { type: 'category', data: marketOps },
    visualMap: {
      min: 0,
      max: 1,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#0e0e11', '#2d9d78', '#e8b923'] },
      textStyle: { color: '#6b6b6f' },
      formatter: (v: unknown) => `${(Number(v) * 100).toFixed(0)}%`,
    },
    series: [
      {
        type: 'heatmap',
        data: data.marketHeatmap.map((d) => [marketZones.indexOf(d.zone), marketOps.indexOf(d.operator), d.pct]),
        label: { show: false },
      },
    ],
  };

  // Hourly line chart
  const hourSet = [...new Set(data.hourly.map((d) => d.pickup_hour))].sort((a, b) => a - b);
  const hourlyOps = [...new Set(data.hourly.map((d) => d.operator))];
  const hourlyOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: hourlyOps },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hourSet.map((h) => `${h}:00`) },
    yAxis: { type: 'value', name: 'Viajes' },
    series: hourlyOps.map((op) => ({
      name: op,
      type: 'line' as const,
      smooth: true,
      data: hourSet.map((h) => {
        const row = data.hourly.find((d) => d.pickup_hour === h && d.operator === op);
        return row?.trips ?? 0;
      }),
      lineStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Market share stacked area
  const marketHourSet = [...new Set(data.marketHourly.map((d) => d.hour))].sort((a, b) => a - b);
  const marketHourlyOps = [...new Set(data.marketHourly.map((d) => d.operator))];
  const marketShareOption: EChartsOption = {
    tooltip: { trigger: 'axis' as const, formatter: (params: unknown) => { const arr = params as Array<{ seriesName: string; value: number; marker: string }>; return arr.map((p) => `${p.marker} ${p.seriesName}: ${(p.value * 100).toFixed(1)}%`).join('<br/>'); } },
    legend: { data: marketHourlyOps },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: marketHourSet.map((h) => `${h}:00`) },
    yAxis: { type: 'value', max: 1, axisLabel: { formatter: (v: unknown) => `${(Number(v) * 100).toFixed(0)}%` } },
    series: marketHourlyOps.map((op) => ({
      name: op,
      type: 'line' as const,
      stack: 'total',
      areaStyle: {},
      smooth: true,
      data: marketHourSet.map((h) => {
        const row = data.marketHourly.find((d) => d.hour === h && d.operator === op);
        return row?.pct ?? 0;
      }),
      lineStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Daily grouped bar
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dailyOps = [...new Set(data.daily.map((d) => d.operator))];
  const dailyOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: dailyOps },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: dayNames },
    yAxis: { type: 'value', name: 'Viajes' },
    series: dailyOps.map((op) => ({
      name: op,
      type: 'bar' as const,
      data: dayNames.map((d) => {
        const row = data.daily.find((r) => r.day_name === d && r.operator === op);
        return row?.trips ?? 0;
      }),
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Airport comparison
  const airportNames = Object.keys(data.airport);
  const airportOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ops },
    grid: { left: 120, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'value', name: 'Viajes' },
    yAxis: { type: 'category', data: airportNames },
    series: ops.map((op) => ({
      name: op,
      type: 'bar' as const,
      data: airportNames.map((a) => data.airport[a].byOperator[op] ?? 0),
      itemStyle: { color: OP_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  return (
    <div className="space-y-8">
      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución de Viajes</h3>
          <EChart option={tripPie} height={320} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución de Ingresos</h3>
          <EChart option={incomePie} height={320} />
        </div>
      </div>

      {/* Metrics table */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Comparación de Métricas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-rule text-ink-muted font-mono text-[10px] uppercase tracking-[0.15em]">
                <th className="text-left py-2 px-2">Operador</th>
                <th className="text-right py-2 px-2">Viajes</th>
                <th className="text-right py-2 px-2">Tarifa Prom.</th>
                <th className="text-right py-2 px-2">Propina Prom.</th>
                <th className="text-right py-2 px-2">Dist. Prom.</th>
                <th className="text-right py-2 px-2">Tiempo Prom.</th>
                <th className="text-right py-2 px-2">$/mi</th>
                <th className="text-right py-2 px-2">$/min</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.metrics).map(([op, m]) => (
                <tr key={op} className="border-b border-border">
                  <td className="py-2 px-2 font-medium" style={{ color: OP_COLORS[op] ?? '#e8e6e3' }}>{op}</td>
                  <td className="text-right py-2 px-2">{formatNumber(m.trips)}</td>
                  <td className="text-right py-2 px-2">{formatMoney(m.avgFare)}</td>
                  <td className="text-right py-2 px-2">{formatMoney(m.avgTip)}</td>
                  <td className="text-right py-2 px-2">{formatMiles(m.avgMiles)}</td>
                  <td className="text-right py-2 px-2">{formatDuration(m.avgTimeMin)}</td>
                  <td className="text-right py-2 px-2">{formatMoney(m.pricePerMile)}</td>
                  <td className="text-right py-2 px-2">{formatMoney(m.pricePerMinute)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tip analysis + histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Análisis de Propinas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-rule text-ink-muted font-mono text-[10px] uppercase tracking-[0.15em]">
                  <th className="text-left py-2 px-2">Operador</th>
                  <th className="text-right py-2 px-2">Propina Prom.</th>
                  <th className="text-right py-2 px-2">% Viajes c/ Propina</th>
                  <th className="text-right py-2 px-2">% del Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.tipAnalysis).map(([op, t]) => (
                  <tr key={op} className="border-b border-border">
                    <td className="py-2 px-2 font-medium" style={{ color: OP_COLORS[op] ?? '#e8e6e3' }}>{op}</td>
                    <td className="text-right py-2 px-2">{formatMoney(t.avgTip)}</td>
                    <td className="text-right py-2 px-2">{formatPercentage(t.pctTripsWithTip)}</td>
                    <td className="text-right py-2 px-2">{formatPercentage(t.tipPctOfIncome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Histograma de Propinas</h3>
          <EChart option={tipHistOption} height={300} />
        </div>
      </div>

      {/* Top zones */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Top Zonas por Operador</h3>
        <EChart option={topZonesOption} height={500} />
      </div>

      {/* Market share heatmap */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Market Share por Zona</h3>
        <EChart option={marketHeatmapOption} height={300} />
      </div>

      {/* Hourly + market share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Viajes por Hora</h3>
          <EChart option={hourlyOption} height={300} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Market Share Horario</h3>
          <EChart option={marketShareOption} height={300} />
        </div>
      </div>

      {/* Daily + airport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Viajes por Día</h3>
          <EChart option={dailyOption} height={300} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Comparación Aeropuertos</h3>
          <EChart option={airportOption} height={300} />
        </div>
      </div>
    </div>
  );
}
