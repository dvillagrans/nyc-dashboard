'use client';

import { useEffect, useState } from 'react';
import { loadAirports, type AirportsData } from '@/lib/data';
import { formatNumber, formatMoney, formatMiles, formatPercentage } from '@/lib/formatters';
import KpiCard from '@/components/dashboard/KpiCard';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

const COLORS = ['#e8b923', '#2d9d78', '#276EF1', '#FF00BF', '#FF9800'];

export default function AirportsTab() {
  const [data, setData] = useState<AirportsData | null>(null);
  const [subTab, setSubTab] = useState<'to' | 'from' | 'both'>('both');

  useEffect(() => {
    loadAirports().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando aeropuertos...</div>;

  const direction = subTab === 'to' ? data.toAirport : subTab === 'from' ? data.fromAirport : null;

  // Donut for operator share
  function operatorDonut(byOperator: Record<string, number> | undefined): EChartsOption {
    if (!byOperator) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: Object.entries(byOperator).map(([name, value], i) => ({
            name,
            value,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
          label: { color: '#e8e6e3' },
        },
      ],
    };
  }

  // Dual-axis bar+line for hourly
  function hourlyChart(hourly: Array<{ pickup_hour: number; trips: number; pct: number }> | undefined): EChartsOption {
    if (!hourly) return {};
    const hours = hourly.map((h) => `${h.pickup_hour}:00`);
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Viajes', '% del total'] },
      grid: { left: 60, right: 60, top: 40, bottom: 30 },
      xAxis: { type: 'category', data: hours },
      yAxis: [
        { type: 'value', name: 'Viajes' },
        { type: 'value', name: '%', axisLabel: { formatter: (v: unknown) => `${(Number(v) * 100).toFixed(0)}%` } },
      ],
      series: [
        {
          name: 'Viajes',
          type: 'bar',
          data: hourly.map((h) => h.trips),
          itemStyle: { color: '#e8b923' },
        },
        {
          name: '% del total',
          type: 'line',
          yAxisIndex: 1,
          data: hourly.map((h) => h.pct),
          smooth: true,
          lineStyle: { color: '#2d9d78' },
          itemStyle: { color: '#2d9d78' },
        },
      ],
    };
  }

  // Airport distribution pie
  function airportDistPie(dist: Array<{ airport: string; trips: number; pct: number }> | undefined): EChartsOption {
    if (!dist) return {};
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: dist.map((d, i) => ({
            name: d.airport,
            value: d.trips,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
          label: { color: '#e8e6e3' },
        },
      ],
    };
  }

  // Box plot (fare distribution)
  const fareLabels = Object.keys(data.fareComparison);
  const boxData = fareLabels.map((label) => {
    const d = data.fareComparison[label];
    return [d.min, d.q1, d.median, d.q3, d.max];
  });

  const boxPlotOption: EChartsOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number[] };
        const [min, q1, median, q3, max] = p.value;
        return `${p.name}<br/>Min: ${formatMoney(min)}<br/>Q1: ${formatMoney(q1)}<br/>Mediana: ${formatMoney(median)}<br/>Q3: ${formatMoney(q3)}<br/>Max: ${formatMoney(max)}`;
      },
    },
    grid: { left: 100, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: 'Tarifa ($)', axisLabel: { formatter: (v: unknown) => `$${v}` } },
    yAxis: { type: 'category', data: fareLabels },
    series: [
      {
        type: 'boxplot',
        data: boxData,
        itemStyle: { color: '#e8b923', borderColor: '#e8b923' },
      },
    ],
  };

  // Weekly trend line
  const weekDays = data.weeklyTrend.map((d) => d.day_name);
  const weeklyTrendOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Al aeropuerto', 'Desde aeropuerto'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: weekDays },
    yAxis: { type: 'value', name: 'Viajes' },
    series: [
      {
        name: 'Al aeropuerto',
        type: 'line',
        smooth: true,
        data: data.weeklyTrend.map((d) => d.to_trips),
        lineStyle: { color: '#e8b923' },
        itemStyle: { color: '#e8b923' },
      },
      {
        name: 'Desde aeropuerto',
        type: 'line',
        smooth: true,
        data: data.weeklyTrend.map((d) => d.from_trips),
        lineStyle: { color: '#2d9d78' },
        itemStyle: { color: '#2d9d78' },
      },
    ],
  };

  // Volume comparison bar
  const volumeOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: 'Viajes' },
    yAxis: { type: 'category', data: ['Al aeropuerto', 'Desde aeropuerto', 'Total aeropuerto'] },
    series: [
      {
        type: 'bar',
        data: [data.kpis.toAirport, data.kpis.fromAirport, data.kpis.totalAirport],
        itemStyle: { color: '#e8b923' },
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Al Aeropuerto" value={formatNumber(data.kpis.toAirport)} subtitle={formatPercentage(data.kpis.toPct)} accent="gold" />
        <KpiCard label="Desde Aeropuerto" value={formatNumber(data.kpis.fromAirport)} subtitle={formatPercentage(data.kpis.fromPct)} accent="green" />
        <KpiCard label="Total Aeropuerto" value={formatNumber(data.kpis.totalAirport)} subtitle={formatPercentage(data.kpis.totalPct)} accent="gold" />
        <KpiCard label="Tarifa Promedio" value={formatMoney(data.kpis.avgFare)} accent="gray" />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-border">
        {(['both', 'to', 'from'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.1em] border-b-2 -mb-[1px] transition-colors ${
              subTab === t ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
            style={{ borderRadius: 0, background: 'transparent' }}
          >
            {t === 'both' ? 'Ambos' : t === 'to' ? 'Al Aeropuerto' : 'Desde Aeropuerto'}
          </button>
        ))}
      </div>

      {/* Direction-specific charts */}
      {direction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-elevated border border-border p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Share por Operador</h3>
            <EChart option={operatorDonut(direction.byOperator)} height={320} />
          </div>
          <div className="bg-bg-elevated border border-border p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución por Hora</h3>
            <EChart option={hourlyChart(direction.hourly)} height={320} />
          </div>
          <div className="bg-bg-elevated border border-border p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución por Aeropuerto</h3>
            <EChart option={airportDistPie(direction.airportDistribution)} height={320} />
          </div>
          <div className="bg-bg-elevated border border-border p-4 flex flex-col justify-center">
            <div className="space-y-2 text-sm">
              {direction.avgMiles !== undefined && (
                <p className="text-ink-muted">Distancia promedio: <span className="text-ink font-medium">{formatMiles(direction.avgMiles)}</span></p>
              )}
              {direction.avgMilesDelta !== undefined && (
                <p className="text-ink-muted">Delta distancia: <span className={direction.avgMilesDelta >= 0 ? 'text-positive' : 'text-negative'}>{direction.avgMilesDelta >= 0 ? '+' : ''}{formatMiles(direction.avgMilesDelta)}</span></p>
              )}
              {direction.avgFare !== undefined && (
                <p className="text-ink-muted">Tarifa promedio: <span className="text-ink font-medium">{formatMoney(direction.avgFare)}</span></p>
              )}
              {direction.avgFareDelta !== undefined && (
                <p className="text-ink-muted">Delta tarifa: <span className={direction.avgFareDelta >= 0 ? 'text-positive' : 'text-negative'}>{direction.avgFareDelta >= 0 ? '+' : ''}{formatMoney(direction.avgFareDelta)}</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Common charts */}
      {!direction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-elevated border border-border p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Volumen Comparativo</h3>
            <EChart option={volumeOption} height={250} />
          </div>
          <div className="bg-bg-elevated border border-border p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Share por Operador (Al)</h3>
            <EChart option={operatorDonut(data.toAirport.byOperator)} height={250} />
          </div>
        </div>
      )}

      {/* Box plot + weekly trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Distribución de Tarifas</h3>
          <EChart option={boxPlotOption} height={300} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Tendencia Semanal</h3>
          <EChart option={weeklyTrendOption} height={300} />
        </div>
      </div>
    </div>
  );
}
