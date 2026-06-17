'use client';

export default function Header() {
  return (
    <header className="border-b-2 border-accent pb-6 mb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-2">
        NYC TLC · FHV Trip Data
      </p>
      <h1 className="font-display text-4xl font-extrabold text-ink leading-tight">
        Ride-Hailing{' '}
        <span className="text-accent">Analytics</span>
      </h1>
      <p className="text-ink-muted mt-2 text-base max-w-2xl">
        Viajes, ingresos y modelos predictivos a partir de datos oficiales de la ciudad de Nueva York.
      </p>
    </header>
  );
}
