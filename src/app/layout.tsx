import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'NYC Ride-Hailing Analytics',
  description: 'Dashboard de análisis de viajes FHV en NYC. Viajes, ingresos, mapas y modelos predictivos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-bg text-ink font-body antialiased">
        <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
