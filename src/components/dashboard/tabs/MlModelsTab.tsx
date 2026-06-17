'use client';

import { useEffect, useState } from 'react';
import { loadMlMock, type MlMockData } from '@/lib/data';
import { formatMoney, formatNumber, formatPercentage } from '@/lib/formatters';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

export default function MlModelsTab() {
  const [data, setData] = useState<MlMockData | null>(null);

  useEffect(() => {
    loadMlMock().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-ink-muted">Cargando modelos ML...</div>;

  // Feature importance horizontal bar
  const features = data.featureImportance.slice().sort((a, b) => a.importance - b.importance);
  const featureOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 200, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: 'Importancia' },
    yAxis: {
      type: 'category',
      data: features.map((f) => f.feature),
      axisLabel: { width: 180, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: features.map((f) => f.importance),
        itemStyle: { color: '#e8b923' },
      },
    ],
  };

  // Gauge for confidence
  const gaugeOption: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 1,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [data.samplePrediction.confidence, '#e8b923'],
              [1, '#1c1c1f'],
            ],
          },
        },
        pointer: { itemStyle: { color: '#e8e6e3' } },
        axisTick: { distance: -20, length: 6, lineStyle: { color: '#6b6b6f' } },
        splitLine: { distance: -24, length: 14, lineStyle: { color: '#6b6b6f' } },
        axisLabel: { color: '#6b6b6f', distance: 30, fontSize: 11 },
        detail: {
          valueAnimation: true,
          formatter: (v: unknown) => `${(Number(v) * 100).toFixed(1)}%`,
          color: '#e8b923',
          fontSize: 24,
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          offsetCenter: [0, '70%'],
        },
        title: { show: false },
        data: [{ value: data.samplePrediction.confidence }],
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Model status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.models.map((model) => (
          <div
            key={model.name}
            className="bg-bg-elevated border border-border p-5 border-l-[3px] border-l-accent"
            style={{ borderRadius: 0 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-2">{model.type}</p>
            <p className="font-display text-xl font-bold text-ink">{model.name}</p>
            <p className="text-sm text-ink-muted mt-1">
              R²: <span className="text-accent font-medium">{model.performance.toFixed(4)}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Feature importance + prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Importancia de Features</h3>
          <EChart option={featureOption} height={400} />
        </div>
        <div className="bg-bg-elevated border border-border p-4">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Predicción de Muestra</h3>

          {/* Input display */}
          <div className="mb-4 p-3 border border-border bg-bg">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted mb-2">Input</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.samplePrediction.input).map(([key, val]) => (
                <div key={key}>
                  <span className="text-ink-muted">{key}: </span>
                  <span className="text-ink font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Predicted fare */}
          <div className="mb-4 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted mb-1">Tarifa Predicha</p>
            <p className="font-display text-4xl font-bold text-accent">{formatMoney(data.samplePrediction.predicted_fare)}</p>
          </div>

          {/* Confidence gauge */}
          <EChart option={gaugeOption} height={250} />
        </div>
      </div>
    </div>
  );
}
