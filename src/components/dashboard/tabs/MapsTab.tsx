'use client';

import { useEffect, useState, useRef } from 'react';
import { loadMaps, type MapsData } from '@/lib/data';
import { formatNumber } from '@/lib/formatters';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

export default function MapsTab() {
  const [data, setData] = useState<MapsData | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    loadMaps().then(setData).catch(console.error);
  }, []);

  useEffect(() => {
    if (!data || !mapContainer.current || mapRef.current) return;

    import('maplibre-gl').then((maplibregl) => {
      import('maplibre-gl/dist/maplibre-gl.css' as string).catch(() => {});

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [-73.95, 40.7],
        zoom: 10,
      });

      map.on('load', () => {
        const maxTrips = Math.max(...data.zoneFeatures.map((z) => z.trips), 1);

        for (const zone of data.zoneFeatures) {
          const radius = Math.max(3, Math.sqrt(zone.trips / maxTrips) * 25);
          const el = document.createElement('div');
          el.style.width = `${radius * 2}px`;
          el.style.height = `${radius * 2}px`;
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'rgba(232, 185, 35, 0.5)';
          el.style.border = '1px solid rgba(232, 185, 35, 0.8)';

          new maplibregl.Marker({ element: el })
            .setLngLat([zone.lon, zone.lat])
            .setPopup(
              new maplibregl.Popup({ closeButton: false }).setHTML(
                `<div style="font-family:Source Sans 3,sans-serif;font-size:13px;color:#e8e6e3;background:#1c1c1f;padding:6px 10px;">
                  <strong>${zone.zone}</strong><br/>
                  ${zone.borough} — ${formatNumber(zone.trips)} viajes
                </div>`
              )
            )
            .addTo(map);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [data]);

  if (!data) return <div className="text-ink-muted">Cargando mapas...</div>;

  // Top zones bar chart
  const topZones = data.zoneFeatures.slice(0, 20);
  const topZonesOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 200, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: 'Viajes' },
    yAxis: {
      type: 'category',
      data: topZones
        .map((z) => z.zone)
        .reverse(),
      axisLabel: { width: 180, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: topZones.map((z) => z.trips).reverse(),
        itemStyle: { color: '#e8b923' },
      },
    ],
  };

  // Sankey diagram — deduplicate cycles (A→B + B→A) by keeping dominant direction
  const pairMap = new Map<string, { source: string; target: string; value: number }>();
  for (const f of data.flows) {
    const a = f.pickup_zone;
    const b = f.dropoff_zone;
    if (a === b) continue; // skip self-loops
    const key = [a, b].sort().join('|||');
    const existing = pairMap.get(key);
    if (!existing || f.trip_count > existing.value) {
      pairMap.set(key, {
        source: a,
        target: b,
        value: f.trip_count,
      });
    }
  }
  const dedupedLinks = Array.from(pairMap.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 30);

  const usedZones = new Set<string>();
  for (const l of dedupedLinks) {
    usedZones.add(l.source);
    usedZones.add(l.target);
  }
  const sankeyNodes = Array.from(usedZones).map((z) => ({ name: z }));
  const sankeyLinks = dedupedLinks;

  const sankeyOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'sankey' as const,
        emphasis: { focus: 'adjacency' as const },
        nodeAlign: 'left' as const,
        data: sankeyNodes,
        links: sankeyLinks,
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: { color: '#e8e6e3', fontSize: 10 },
        itemStyle: { color: '#e8b923', borderColor: '#1c1c1f' },
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Top Zones Bar */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Top 20 Zonas por Viajes</h3>
        <EChart option={topZonesOption} height={500} />
      </div>

      {/* MapLibre Map */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Mapa de Viajes por Zona</h3>
        <div
          ref={mapContainer}
          className="w-full border border-border"
          style={{ height: 500, borderRadius: 0 }}
        />
      </div>

      {/* Sankey */}
      <div className="bg-bg-elevated border border-border p-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">Flujo Top: Origen → Destino</h3>
        <EChart option={sankeyOption} height={600} />
      </div>
    </div>
  );
}
