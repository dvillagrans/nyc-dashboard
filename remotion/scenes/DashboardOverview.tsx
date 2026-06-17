import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';
import BrowserMockup from '../components/BrowserMockup';
import AnimatedCounter from '../components/AnimatedCounter';

const KPI_DATA = [
  { label: 'TOTAL TRIPS', value: 8000, prefix: '', suffix: '', decimals: 0 },
  { label: 'TOTAL INCOME', value: 153548, prefix: '$', suffix: '', decimals: 0 },
  { label: 'AVG DAILY TRIPS', value: 276, prefix: '', suffix: '', decimals: 0 },
  { label: 'AVG MILES', value: 5.0, prefix: '', suffix: ' mi', decimals: 1 },
];

export default function DashboardOverview() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header animation
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headerY = interpolate(frame, [0, 20], [20, 0], {
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
        padding: 40,
      }}
    >
      <BrowserMockup>
        <div style={{ padding: '40px 50px', background: '#08080a' }}>
          {/* Dashboard Header */}
          <div
            style={{
              opacity: headerOpacity,
              transform: `translateY(${headerY}px)`,
              borderBottom: '2px solid #e8b923',
              paddingBottom: 24,
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#e8b923',
                marginBottom: 8,
              }}
            >
              NYC TLC · FHV Trip Data
            </p>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 36,
                fontWeight: 800,
                color: '#e8e6e3',
                lineHeight: 1.2,
              }}
            >
              Ride-Hailing{' '}
              <span style={{ color: '#e8b923' }}>Analytics</span>
            </h1>
          </div>

          {/* KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {KPI_DATA.map((kpi, index) => {
              const cardDelay = 20 + index * 12;
              const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const cardY = interpolate(frame, [cardDelay, cardDelay + 15], [30, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <div
                  key={kpi.label}
                  style={{
                    background: '#111114',
                    border: '1px solid #222225',
                    borderLeft: '3px solid #e8b923',
                    padding: 20,
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: '#6b6b6b',
                      marginBottom: 8,
                    }}
                  >
                    {kpi.label}
                  </p>
                  <AnimatedCounter
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    decimals={kpi.decimals}
                    startFrame={cardDelay + 5}
                    duration={40}
                    fontSize={32}
                  />
                </div>
              );
            })}
          </div>

          {/* Chart placeholder */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {[0, 1].map((index) => {
              const chartDelay = 70 + index * 15;
              const chartOpacity = interpolate(frame, [chartDelay, chartDelay + 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const chartY = interpolate(frame, [chartDelay, chartDelay + 20], [40, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <div
                  key={index}
                  style={{
                    background: '#111114',
                    border: '1px solid #222225',
                    padding: 20,
                    height: 200,
                    opacity: chartOpacity,
                    transform: `translateY(${chartY}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      color: '#6b6b6b',
                      marginBottom: 12,
                    }}
                  >
                    {index === 0 ? 'TRIPS BY HOUR' : 'UBER VS LYFT'}
                  </p>
                  {/* Stylized chart bars */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    {index === 0 ? (
                      // Bar chart
                      Array.from({ length: 12 }).map((_, i) => {
                        const heights = [30, 20, 15, 12, 15, 25, 40, 55, 60, 55, 50, 45];
                        const barDelay = chartDelay + 20 + i * 2;
                        const barHeight = interpolate(frame, [barDelay, barDelay + 15], [0, heights[i]], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                        });
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: barHeight,
                              background: i % 2 === 0 ? '#e8b923' : '#c49a1a',
                              borderRadius: '2px 2px 0 0',
                            }}
                          />
                        );
                      })
                    ) : (
                      // Pie chart representation
                      <div
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `conic-gradient(#ff00bf 0% 75%, #276ef1 75% 100%)`,
                          margin: 'auto',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 20,
                            borderRadius: '50%',
                            background: '#111114',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BrowserMockup>
    </AbsoluteFill>
  );
}
