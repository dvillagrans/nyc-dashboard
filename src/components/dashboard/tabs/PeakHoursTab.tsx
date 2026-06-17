'use client';

import { useEffect, useState } from 'react';
import { loadPeakHours, type PeakHoursData } from '@/lib/data';
import { formatNumber } from '@/lib/formatters';
import { OPERATOR_COLORS } from '@/lib/constants';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

export default function PeakHoursTab() {
  const [data, setData] = useState<PeakHoursData | null>(null);

  useEffect(() => {
    loadPeakHours().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando horas pico...</div>;

  const hours = [...new Set(data.byHourOperator.map((d) => d.pickup_hour))].sort((a, b) => a - b);
  const operators = [...new Set(data.byHourOperator.map((d) => d.operator))];
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Heatmap by hour and operator
  const hourOperatorHeatmap: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] };
        const [x, y, val] = p.value;
        return `${operators[y]} — ${hours[x]}:00 — ${formatNumber(val)} viajes`;
      },
    },
    grid: { left: 80, right: 40, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: hours.map((h) => `${h}h`) },
    yAxis: { type: 'category', data: operators },
    visualMap: {
      min: 0,
      max: Math.max(...data.byHourOperator.map((d) => d.trips), 1),
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#0e0e11', '#1a3a2a', '#2d9d78', '#e8b923'] },
      textStyle: { color: '#6b6b6f' },
    },
    series: [
      {
        type: 'heatmap',
        data: data.byHourOperator.map((d) => [hours.indexOf(d.pickup_hour), operators.indexOf(d.operator), d.trips]),
        label: { show: false },
      },
    ],
  };

  // Line chart by hour
  const hourlyLine: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: operators },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hours.map((h) => `${h}:00`) },
    yAxis: { type: 'value', name: 'Viajes' },
    series: operators.map((op) => ({
      name: op,
      type: 'line' as const,
      smooth: true,
      data: hours.map((h) => {
        const row = data.byHourOperator.find((d) => d.pickup_hour === h && d.operator === op);
        return row?.trips ?? 0;
      }),
      lineStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Heatmap by weekday and operator
  const weekdayOperatorHeatmap: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] };
        const [x, y, val] = p.value;
        return `${operators[y]} — ${days[x]} — ${formatNumber(val)} viajes`;
      },
    },
    grid: { left: 80, right: 40, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'category', data: operators },
    visualMap: {
      min: 0,
      max: Math.max(...data.byWeekdayOperator.map((d) => d.trips), 1),
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#0e0e11', '#1a3a2a', '#2d9d78', '#e8b923'] },
      textStyle: { color: '#6b6b6f' },
    },
    series: [
      {
        type: 'heatmap',
        data: data.byWeekdayOperator.map((d) => [days.indexOf(d.day_name), operators.indexOf(d.operator), d.trips]),
        label: { show: false },
      },
    ],
  };

  // Top 15 zones bar chart
  const topZones = data.topZonesOperator.slice(0, 30);
  const zoneNames = [...new Set(topZones.map((d) => d.pickup_zone))].slice(0, 15);
  const topZonesOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: operators },
    grid: { left: 200, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'value', name: 'Viajes' },
    yAxis: { type: 'category', data: zoneNames.slice().reverse(), axisLabel: { width: 180, overflow: 'truncate' } },
    series: operators.map((op) => ({
      name: op,
      type: 'bar' as const,
      stack: 'total',
      data: zoneNames
        .slice()
        .reverse()
        .map((z) => {
          const row = topZones.find((d) => d.pickup_zone === z && d.operator === op);
          return row?.trips ?? 0;
        }),
      itemStyle: { color: OPERATOR_COLORS[op] ?? '#6b6b6f' },
    })),
  };

  // Hot spots heatmap (hour x weekday)
  const hotspotsOption: EChartsOption = {
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
      max: Math.max(...data.hotspots.map((d) => d[2]), 1),
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
        data: data.hotspots,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Heatmap: Hora × Operador</h3>
          <EChart option={hourOperatorHeatmap} height={250} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Viajes por Hora</h3>
          <EChart option={hourlyLine} height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Heatmap: Día × Operador</h3>
          <EChart option={weekdayOperatorHeatmap} height={250} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Top 15 Zonas</h3>
          <EChart option={topZonesOption} height={400} />
        </div>
      </div>

      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Hot Spots: Hora × Día</h3>
        <EChart option={hotspotsOption} height={350} />
      </div>
    </div>
  );
}
