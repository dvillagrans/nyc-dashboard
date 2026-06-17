import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

// Zone data from maps.json (top zones by trips)
const ZONES = [
  { zone: 'Zone_138', borough: 'Queens', trips: 155, lat: 40.787, lon: -73.977 },
  { zone: 'Zone_132', borough: 'Queens', trips: 120, lat: 40.575, lon: -73.780 },
  { zone: 'Zone_79', borough: 'Brooklyn', trips: 120, lat: 40.635, lon: -74.017 },
  { zone: 'Zone_161', borough: 'Queens', trips: 111, lat: 40.639, lon: -73.952 },
  { zone: 'Zone_61', borough: 'Manhattan', trips: 104, lat: 40.648, lon: -73.847 },
  { zone: 'Zone_231', borough: 'Staten Island', trips: 100, lat: 40.827, lon: -74.062 },
  { zone: 'Zone_68', borough: 'Manhattan', trips: 99, lat: 40.831, lon: -74.251 },
  { zone: 'Zone_76', borough: 'Brooklyn', trips: 95, lat: 40.798, lon: -73.984 },
  { zone: 'Zone_164', borough: 'Queens', trips: 93, lat: 40.713, lon: -74.063 },
  { zone: 'Zone_230', borough: 'Staten Island', trips: 91, lat: 40.755, lon: -74.000 },
  { zone: 'Zone_37', borough: 'Manhattan', trips: 89, lat: 40.611, lon: -73.962 },
  { zone: 'Zone_7', borough: 'Manhattan', trips: 88, lat: 40.503, lon: -73.806 },
  { zone: 'Zone_48', borough: 'Manhattan', trips: 88, lat: 40.706, lon: -74.245 },
  { zone: 'Zone_234', borough: 'Staten Island', trips: 87, lat: 40.694, lon: -73.715 },
  { zone: 'Zone_112', borough: 'Brooklyn', trips: 86, lat: 40.548, lon: -73.787 },
  { zone: 'Zone_148', borough: 'Queens', trips: 83, lat: 40.699, lon: -73.730 },
  { zone: 'Zone_249', borough: 'Staten Island', trips: 83, lat: 40.902, lon: -73.775 },
  { zone: 'Zone_246', borough: 'Staten Island', trips: 81, lat: 40.886, lon: -73.850 },
  { zone: 'Zone_13', borough: 'Manhattan', trips: 80, lat: 40.864, lon: -73.923 },
  { zone: 'Zone_265', borough: 'Staten Island', trips: 80, lat: 40.590, lon: -74.077 },
];

// Simplified NYC borough outlines (SVG path data)
const NYC_PATH = `M 280 120 L 320 100 L 360 110 L 380 140 L 370 180 L 350 200 L 330 220
  L 310 240 L 280 250 L 260 230 L 240 200 L 250 170 L 260 140 Z
  M 350 200 L 380 210 L 410 230 L 420 260 L 400 290 L 370 300 L 340 280 L 330 250 Z
  M 240 200 L 220 220 L 200 260 L 210 300 L 240 320 L 280 310 L 310 280 L 310 240
  L 280 250 L 260 230 Z
  M 310 280 L 340 300 L 370 310 L 400 300 L 420 310 L 440 340 L 420 370 L 380 380
  L 340 360 L 310 330 Z
  M 180 260 L 200 240 L 220 250 L 230 280 L 210 310 L 180 300 Z`;

// Convert lat/lon to SVG coordinates (simplified projection)
function toSVG(lat: number, lon: number): { x: number; y: number } {
  const minLat = 40.49;
  const maxLat = 40.92;
  const minLon = -74.26;
  const maxLon = -73.70;

  const x = 140 + ((lon - minLon) / (maxLon - minLon)) * 360;
  const y = 380 - ((lat - minLat) / (maxLat - minLat)) * 300;

  return { x, y };
}

const BOROUGH_COLORS: Record<string, string> = {
  Manhattan: '#e8b923',
  Brooklyn: '#c49a1a',
  Queens: '#a08818',
  'Staten Island': '#7a6810',
  Bronx: '#5a4e0e',
};

export default function MapScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Map outline fade in
  const mapOpacity = interpolate(frame, [10, 30], [0, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out
  const fadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#08080a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut,
      }}
    >
      {/* Title */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#e8b923',
          marginBottom: 32,
          opacity: titleOpacity,
        }}
      >
        Trip Distribution Across NYC
      </p>

      {/* Map Container */}
      <div style={{ position: 'relative', width: 700, height: 500 }}>
        <svg width="700" height="500" viewBox="0 0 600 420">
          {/* NYC outline */}
          <path
            d={NYC_PATH}
            fill="none"
            stroke="#e8b923"
            strokeWidth="1.5"
            opacity={mapOpacity}
          />

          {/* Grid lines for atmosphere */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="100"
              y1={60 + i * 45}
              x2="550"
              y2={60 + i * 45}
              stroke="#1a1a1f"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={100 + i * 50}
              y1="60"
              x2={100 + i * 50}
              y2="380"
              stroke="#1a1a1f"
              strokeWidth="0.5"
            />
          ))}

          {/* Zone circles */}
          {ZONES.map((zone, index) => {
            const pos = toSVG(zone.lat, zone.lon);
            const delay = 30 + index * 5;
            const maxRadius = Math.sqrt(zone.trips) * 1.5;

            const circleScale = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: {
                damping: 15,
                stiffness: 100,
                mass: 0.5,
              },
              durationInFrames: 20,
            });

            const radius = maxRadius * circleScale;

            const glowOpacity = interpolate(
              frame,
              [delay + 10, delay + 20, delay + 40, delay + 50],
              [0, 0.6, 0.6, 0.3],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            );

            const color = BOROUGH_COLORS[zone.borough] || '#e8b923';

            return (
              <g key={zone.zone}>
                {/* Glow */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius * 2}
                  fill={color}
                  opacity={glowOpacity * 0.15}
                />
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={color}
                  opacity={0.8}
                />
                {/* Inner bright dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={3}
                  fill="#fff"
                  opacity={circleScale * 0.9}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 24,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {Object.entries(BOROUGH_COLORS).map(([name, color]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: '#6b6b6b',
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}
