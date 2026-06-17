import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  startFrame?: number;
  fontSize?: number;
  color?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 60,
  startFrame = 0,
  fontSize = 72,
  color = 'var(--accent)',
  decimals = 0,
}: AnimatedCounterProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 30,
      stiffness: 80,
      mass: 0.8,
    },
    durationInFrames: duration,
  });

  const currentValue = interpolate(progress, [0, 1], [0, value]);

  const formatted = decimals > 0
    ? currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : Math.round(currentValue).toLocaleString('en-US');

  return (
    <span
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize,
        fontWeight: 800,
        color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}
