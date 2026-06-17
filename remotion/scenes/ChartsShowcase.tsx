import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

// Heatmap data (hour x weekday) - simplified
const HEATMAP_DATA = [
  [2, 3, 1, 1, 2, 5, 4], // 00
  [1, 2, 1, 1, 1, 3, 2], // 01
  [1, 1, 1, 1, 1, 2, 1], // 02
  [1, 1, 1, 1, 1, 1, 1], // 03
  [1, 1, 1, 1, 1, 2, 1], // 04
  [2, 2, 2, 2, 2, 3, 2], // 05
  [3, 4, 4, 4, 4, 4, 3], // 06
  [5, 6, 6, 6, 5, 5, 4], // 07
  [6, 7, 7, 7, 6, 6, 5], // 08
  [5, 6, 6, 6, 5, 6, 5], // 09
  [5, 5, 5, 5, 5, 5, 5], // 10
  [4, 5, 5, 5, 4, 5, 4], // 11
  [5, 5, 5, 5, 5, 5, 5], // 12
  [5, 6, 6, 6, 6, 6, 5], // 13
  [5, 6, 6, 6, 6, 5, 5], // 14
  [6, 6, 6, 6, 6, 6, 5], // 15
  [6, 7, 7, 7, 7, 6, 5], // 16
  [7, 8, 8, 8, 7, 7, 6], // 17
  [7, 8, 8, 8, 7, 7, 6], // 18
  [6, 7, 7, 7, 6, 7, 6], // 19
  [6, 6, 6, 6, 6, 7, 6], // 20
  [6, 6, 6, 6, 6, 7, 6], // 21
  [5, 5, 5, 5, 6, 7, 6], // 22
  [4, 4, 4, 4, 5, 6, 5], // 23
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getHeatColor(value: number): string {
  const colors = [
    '#0a0a0c',
    '#1a1508',
    '#2a2010',
    '#3a2b18',
    '#4a3620',
    '#5a4128',
    '#7a5a30',
    '#a07828',
    '#c49a1a',
    '#e8b923',
  ];
  return colors[Math.min(value, colors.length - 1)];
}

// Bar chart data
const BAR_DATA = [
  { hour: '6AM', lyft: 171, uber: 66 },
  { hour: '7AM', lyft: 243, uber: 80 },
  { hour: '8AM', lyft: 293, uber: 86 },
  { hour: '9AM', lyft: 263, uber: 90 },
  { hour: '5PM', lyft: 330, uber: 123 },
  { hour: '6PM', lyft: 310, uber: 112 },
];

const PIE_LYFT = 74.7;
const PIE_UBER = 25.3;

export default function ChartsShowcase() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene 1: Heatmap (0-90)
  const heatmapOpacity = interpolate(frame, [0, 15, 80, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const heatmapScale = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 2: Pie chart (90-180)
  const pieOpacity = interpolate(frame, [85, 100, 170, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pieRotation = interpolate(frame, [90, 140], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 3: Bar chart (180-270)
  const barOpacity = interpolate(frame, [175, 190, 260, 270], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at end
  const fadeOut = interpolate(frame, [290, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#08080a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      {/* HEATMAP */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: heatmapOpacity,
          transform: `scale(${heatmapScale})`,
          padding: 60,
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#e8b923',
            marginBottom: 48,
          }}
        >
          Trip Density — Hour × Day of Week
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Hour labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 24 }}>
            {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
              <div
                key={h}
                style={{
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 14,
                  color: '#6b6b6b',
                }}
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {/* Grid */}
          <div>
            {/* Weekday labels */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 6, paddingLeft: 2 }}>
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  style={{
                    width: 95,
                    textAlign: 'center',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 14,
                    color: '#6b6b6b',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Cells */}
            {HEATMAP_DATA.map((row, hourIdx) => (
              <div key={hourIdx} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                {row.map((val, dayIdx) => {
                  const cellDelay = 15 + (hourIdx * 7 + dayIdx) * 0.5;
                  const cellOpacity = interpolate(frame, [cellDelay, cellDelay + 5], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  return (
                    <div
                      key={dayIdx}
                      style={{
                        width: 95,
                        height: 38,
                        background: getHeatColor(val),
                        borderRadius: 3,
                        opacity: hourIdx % 3 === 0 ? cellOpacity : cellOpacity * 0.9,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PIE CHART */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pieOpacity,
          gap: 40,
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#e8b923',
          }}
        >
          Market Share — Uber vs Lyft
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 100 }}>
          {/* Pie */}
          <div
            style={{
              width: 450,
              height: 450,
              borderRadius: '50%',
              background: `conic-gradient(#ff00bf 0% ${PIE_LYFT}%, #276ef1 ${PIE_LYFT}% 100%)`,
              transform: `rotate(${pieRotation}deg)`,
              position: 'relative',
              boxShadow: '0 0 60px rgba(232,185,35,0.15)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 90,
                borderRadius: '50%',
                background: '#08080a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#e8e6e3',
                }}
              >
                8,000
              </span>
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { name: 'Lyft', pct: PIE_LYFT, color: '#ff00bf', trips: '5,973' },
              { name: 'Uber', pct: PIE_UBER, color: '#276ef1', trips: '2,027' },
            ].map((item, i) => {
              const legendDelay = 100 + i * 15;
              const legendOpacity = interpolate(frame, [legendDelay, legendDelay + 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    opacity: legendOpacity,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      background: item.color,
                      borderRadius: 3,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#e8e6e3',
                      }}
                    >
                      {item.name} — {item.pct}%
                    </p>
                    <p
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 16,
                        color: '#6b6b6b',
                      }}
                    >
                      {item.trips} trips
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: barOpacity,
          padding: '60px 100px',
        }}
      >
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#e8b923',
            marginBottom: 40,
          }}
        >
          Peak Hours — Trips by Hour
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 32,
            height: 500,
            padding: '0 40px',
          }}
        >
          {BAR_DATA.map((item, index) => {
            const maxHeight = 450;
            const lyftHeight = (item.lyft / 350) * maxHeight;
            const uberHeight = (item.uber / 350) * maxHeight;
            const barDelay = 190 + index * 8;

            const lyftBarHeight = interpolate(frame, [barDelay, barDelay + 20], [0, lyftHeight], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const uberBarHeight = interpolate(frame, [barDelay + 5, barDelay + 25], [0, uberHeight], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={item.hour}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: 50,
                      height: lyftBarHeight,
                      background: '#ff00bf',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <div
                    style={{
                      width: 50,
                      height: uberBarHeight,
                      background: '#276ef1',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 15,
                    color: '#6b6b6b',
                  }}
                >
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, background: '#ff00bf', borderRadius: 2 }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: '#6b6b6b' }}>
              Lyft
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, background: '#276ef1', borderRadius: 2 }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: '#6b6b6b' }}>
              Uber
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
