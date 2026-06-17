'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  className?: string;
  onEvents?: Record<string, (params: unknown) => void>;
}

const DARK_DEFAULTS: Partial<EChartsOption> = {
  backgroundColor: 'transparent',
  textStyle: { color: '#e8e6e3', fontFamily: 'Source Sans 3, sans-serif' },
  title: { textStyle: { color: '#e8e6e3' } },
  legend: {
    textStyle: { color: '#6b6b6f' },
    pageTextStyle: { color: '#6b6b6f' },
  },
  tooltip: {
    backgroundColor: '#1c1c1f',
    borderColor: '#2a2a2e',
    textStyle: { color: '#e8e6e3' },
  },
  grid: {
    borderColor: '#1c1c1f',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#1c1c1f' } },
    axisTick: { lineStyle: { color: '#1c1c1f' } },
    axisLabel: { color: '#6b6b6f' },
    splitLine: { lineStyle: { color: '#1c1c1f' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#1c1c1f' } },
    axisTick: { lineStyle: { color: '#1c1c1f' } },
    axisLabel: { color: '#6b6b6f' },
    splitLine: { lineStyle: { color: '#1c1c1f' } },
  },
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export default function EChart({ option, height = 400, className = '', onEvents }: EChartProps) {
  const merged = deepMerge(DARK_DEFAULTS as Record<string, unknown>, option as Record<string, unknown>) as EChartsOption;

  return (
    <div className={className}>
      <ReactECharts
        option={merged}
        style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  );
}
