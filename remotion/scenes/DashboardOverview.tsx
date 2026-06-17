import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';
import AnimatedCounter from '../components/AnimatedCounter';

const KPI_DATA = [
  { label: 'VIAJES', value: 8000, prefix: '', suffix: '', decimals: 0, color: '#e8b923' },
  { label: 'INGRESOS TOTALES', value: 153548, prefix: '$', suffix: '', decimals: 0, color: '#2d9d78' },
  { label: 'OPERADORES', value: 2, prefix: '', suffix: '', decimals: 0, color: '#e8b923' },
  { label: 'DIAS UNICOS', value: 29, prefix: '', suffix: '', decimals: 0, color: '#6b6b6b' },
];

const INSIGHTS = [
  { label: 'PROMEDIO DIARIO', value: 276, prefix: '', suffix: '', decimals: 0, color: '#e8b923' },
  { label: 'DISTANCIA PROMEDIO', value: 5.0, prefix: '', suffix: ' mi', decimals: 1, color: '#6b6b6b' },
  { label: 'DURACION PROMEDIO', value: 19.2, prefix: '', suffix: ' min', decimals: 1, color: '#6b6b6b' },
];

const TABS = ['Resumen General', 'Horas Pico', 'Mapas', 'Uber vs Lyft', 'Ingresos', 'Aeropuertos', 'Modelos ML'];

const BOROUGH_DATA = [
  { name: 'Manhattan', pct: 42 },
  { name: 'Brooklyn', pct: 24 },
  { name: 'Queens', pct: 22 },
  { name: 'Bronx', pct: 8 },
  { name: 'Staten Island', pct: 4 },
];

const BAR_HEIGHTS = [30, 20, 15, 12, 15, 25, 40, 55, 60, 55, 50, 45, 40, 38, 42, 50, 58, 62, 55, 48, 42, 38, 30, 22];

/**
 * Zoom timeline (total 450 frames = 15s):
 * 0-100:    Full dashboard — everything animates in
 * 100-130:  Smooth zoom into KPIs section
 * 130-220:  Hold on KPIs, counters running
 * 220-260:  Pan right to charts
 * 260-350:  Hold on charts, bars animate
 * 350-390:  Pull back to full view
 * 390-450:  Full dashboard hold + fade out
 */
export default function DashboardOverview() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera: scale and translate for zoom effect
  let camScale = 1;
  let camX = 0;
  let camY = 0;

  if (frame < 100) {
    // Full view
    camScale = 1;
    camX = 0;
    camY = 0;
  } else if (frame < 130) {
    // Zoom into KPIs (top area)
    const t = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const ease = t * t * (3 - 2 * t); // smoothstep
    camScale = 1 + ease * 0.6; // 1.0 → 1.6
    camY = ease * 180; // shift down to center on KPIs
  } else if (frame < 220) {
    // Hold on KPIs
    camScale = 1.6;
    camY = 180;
  } else if (frame < 260) {
    // Pan from KPIs to charts (right side)
    const t = interpolate(frame, [220, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const ease = t * t * (3 - 2 * t);
    camScale = 1.6 - ease * 0.15; // 1.6 → 1.45
    camY = 180 - ease * 100; // pan up slightly
    camX = -ease * 350; // pan right
  } else if (frame < 350) {
    // Hold on charts
    camScale = 1.45;
    camX = -350;
    camY = 80;
  } else if (frame < 390) {
    // Pull back to full
    const t = interpolate(frame, [350, 390], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const ease = t * t * (3 - 2 * t);
    camScale = 1.45 - ease * 0.45;
    camX = -350 + ease * 350;
    camY = 80 - ease * 80;
  } else {
    // Full view hold
    camScale = 1;
    camX = 0;
    camY = 0;
  }

  // Vignette overlay during zoom
  const vignetteOpacity = frame > 100 && frame < 390
    ? interpolate(frame, [100, 120, 370, 390], [0, 0.4, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Fade out
  const fadeOut = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const fadeIn = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slideUp = (start: number, end: number, from: number) =>
    interpolate(frame, [start, end], [from, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#08080a', opacity: fadeOut, overflow: 'hidden' }}>
      {/* Camera wrapper */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${camScale}) translate(${camX}px, ${camY}px)`,
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '28px 50px 0 50px',
            opacity: fadeIn(0, 15),
            transform: `translateY(${slideUp(0, 15, 20)}px)`,
          }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#e8b923', marginBottom: 6 }}>
            NYC TLC · FHV Trip Data
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, color: '#e8e6e3', lineHeight: 1.1 }}>
            Ride-Hailing <span style={{ color: '#e8b923' }}>Analytics</span>
          </h1>
          <div style={{ width: '100%', height: 2, background: '#e8b923', marginTop: 16 }} />
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            padding: '0 50px',
            marginTop: 16,
            borderBottom: '1px solid #2a2a2e',
            opacity: fadeIn(10, 25),
          }}
        >
          {TABS.map((tab, i) => (
            <div
              key={tab}
              style={{
                padding: '10px 18px',
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: i === 0 ? '#e8b923' : '#6b6b6b',
                borderBottom: i === 0 ? '2px solid #e8b923' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 50px 30px 50px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {KPI_DATA.map((kpi, i) => {
              const delay = 15 + i * 8;
              return (
                <div
                  key={kpi.label}
                  style={{
                    background: '#0e0e11',
                    border: '1px solid #1c1c1f',
                    borderLeft: `3px solid ${kpi.color}`,
                    padding: '18px 22px',
                    opacity: fadeIn(delay, delay + 12),
                    transform: `translateY(${slideUp(delay, delay + 12, 25)}px)`,
                  }}
                >
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6b6b', marginBottom: 6 }}>
                    {kpi.label}
                  </p>
                  <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} startFrame={delay + 3} duration={35} fontSize={36} color={kpi.color} />
                </div>
              );
            })}
          </div>

          {/* Insights Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {INSIGHTS.map((ins, i) => {
              const delay = 50 + i * 8;
              return (
                <div
                  key={ins.label}
                  style={{
                    background: '#0e0e11',
                    border: '1px solid #1c1c1f',
                    borderLeft: `3px solid ${ins.color}`,
                    padding: '14px 20px',
                    opacity: fadeIn(delay, delay + 12),
                    transform: `translateY(${slideUp(delay, delay + 12, 20)}px)`,
                  }}
                >
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6b6b', marginBottom: 4 }}>
                    {ins.label}
                  </p>
                  <AnimatedCounter value={ins.value} prefix={ins.prefix} suffix={ins.suffix} decimals={ins.decimals} startFrame={delay + 3} duration={35} fontSize={28} color={ins.color} />
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
            {/* Bar Chart */}
            <div
              style={{
                background: '#0e0e11',
                border: '1px solid #1c1c1f',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                opacity: fadeIn(75, 95),
                transform: `translateY(${slideUp(75, 95, 30)}px)`,
              }}
            >
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6b6b', marginBottom: 12 }}>
                Distribucion de viajes por hora
              </p>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, padding: '0 4px' }}>
                {BAR_HEIGHTS.map((h, i) => {
                  const barDelay = 95 + i * 2;
                  const barH = interpolate(frame, [barDelay, barDelay + 15], [0, h], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                  return (
                    <div key={i} style={{ flex: 1, height: barH, background: i % 2 === 0 ? '#e8b923' : '#c49a1a', borderRadius: '2px 2px 0 0' }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {['0', '4', '8', '12', '16', '20', '23'].map((h) => (
                  <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#6b6b6b' }}>{h}h</span>
                ))}
              </div>
            </div>

            {/* Borough Pie + Operator Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: '#0e0e11',
                  border: '1px solid #1c1c1f',
                  padding: '16px 20px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: fadeIn(80, 100),
                  transform: `translateY(${slideUp(80, 100, 25)}px)`,
                }}
              >
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6b6b', marginBottom: 10 }}>
                  Distribucion por distrito
                </p>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'conic-gradient(#3b82f6 0% 42%, #ec4899 42% 66%, #22c55e 66% 88%, #f59e0b 88% 96%, #a855f7 96% 100%)', position: 'relative', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', inset: 25, borderRadius: '50%', background: '#0e0e11' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {BOROUGH_DATA.map((b) => (
                      <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: b.name === 'Manhattan' ? '#3b82f6' : b.name === 'Brooklyn' ? '#ec4899' : b.name === 'Queens' ? '#22c55e' : b.name === 'Bronx' ? '#f59e0b' : '#a855f7' }} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b6b6b' }}>{b.name}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#e8e6e3', marginLeft: 'auto' }}>{b.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#0e0e11',
                  border: '1px solid #1c1c1f',
                  padding: '14px 20px',
                  opacity: fadeIn(90, 110),
                  transform: `translateY(${slideUp(90, 110, 20)}px)`,
                }}
              >
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b6b6b', marginBottom: 8 }}>
                  Resumen por operador
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { name: 'Uber', trips: '2,027', income: '$37,837', color: '#276ef1' },
                    { name: 'Lyft', trips: '5,973', income: '$115,711', color: '#ff00bf' },
                  ].map((op) => (
                    <div key={op.name} style={{ flex: 1, background: '#08080a', border: '1px solid #1c1c1f', padding: '10px 14px', borderLeft: `3px solid ${op.color}` }}>
                      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: op.color, marginBottom: 4 }}>{op.name}</p>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b6b6b' }}>{op.trips} viajes · {op.income}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette overlay during zoom */}
      {vignetteOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,8,10,0.8) 100%)',
            opacity: vignetteOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
}
