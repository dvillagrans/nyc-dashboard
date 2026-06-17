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

// Simplified NYC borough outlines (SVG path data) — scaled 1.33x
const NYC_PATH = `M 373 160 L 426 133 L 479 146 L 505 186 L 492 240 L 466 266 L 439 293
  L 412 320 L 373 333 L 346 306 L 319 266 L 333 226 L 346 186 Z
  M 466 266 L 505 279 L 545 306 L 558 346 L 532 386 L 492 399 L 453 373 L 439 333 Z
  M 319 266 L 293 293 L 266 346 L 279 399 L 319 426 L 373 412 L 412 373 L 412 320
  L 373 333 L 346 306 Z
  M 412 373 L 453 399 L 492 412 L 532 399 L 558 412 L 585 453 L 558 492 L 505 505
  L 453 479 L 412 439 Z
  M 240 346 L 266 319 L 293 333 L 306 373 L 279 412 L 240 399 Z`;

// Convert lat/lon to SVG coordinates (simplified projection)
function toSVG(lat: number, lon: number): { x: number; y: number } {
  const minLat = 40.49;
  const maxLat = 40.92;
  const minLon = -74.26;
  const maxLon = -73.70;

  const x = 180 + ((lon - minLon) / (maxLon - minLon)) * 480;
  const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 400;

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
          fontSize: 18,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#e8b923',
          marginBottom: 48,
          opacity: titleOpacity,
        }}
      >
        Trip Distribution Across NYC
      </p>

      {/* Map Container */}
      <div style={{ position: 'relative', width: 900, height: 650 }}>
        <svg width="900" height="650" viewBox="0 0 800 560">
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
              x1="130"
              y1={80 + i * 60}
              x2="730"
              y2={80 + i * 60}
              stroke="#1a1a1f"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={130 + i * 67}
              y1="80"
              x2={130 + i * 67}
              y2="500"
              stroke="#1a1a1f"
              strokeWidth="0.5"
            />
          ))}

          {/* Zone circles */}
          {ZONES.map((zone, index) => {
            const pos = toSVG(zone.lat, zone.lon);
            const delay = 30 + index * 5;
            const maxRadius = Math.sqrt(zone.trips) * 2.5;

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
                  r={5}
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
          marginTop: 36,
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
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: color,
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 14,
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
