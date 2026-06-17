export const NYC_BOUNDS: [[number, number], [number, number]] = [
  [40.477399, -74.259090],
  [40.917577, -73.700272],
];

export const CHART_COLORS = {
  uber: '#276EF1',
  lyft: '#FF00BF',
  yellow: '#e8b923',
  green: '#2d9d78',
  orange: '#FF9800',
  blue: '#2196F3',
};

export const OPERATOR_COLORS: Record<string, string> = {
  Uber: '#276EF1',
  LYFT: '#FF00BF',
  Lyft: '#FF00BF',
  UBER: '#276EF1',
};

export const BOROUGH_COLORS: Record<string, string> = {
  Manhattan: '#3b82f6',
  Brooklyn: '#ec4899',
  Queens: '#22c55e',
  Bronx: '#f59e0b',
  'Staten Island': '#a855f7',
  EWR: '#64748b',
};

export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const TAB_LABELS: Record<string, string> = {
  summary: 'Resumen General',
  'peak-hours': 'Horas Pico',
  map: 'Mapa de Viajes',
  income: 'Ingresos & Tarifas',
  'uber-vs-lyft': 'Uber vs Lyft',
  airport: 'Aeropuerto',
  'ml-models': 'Modelos ML',
};

export const QUICK_DATE_RANGES = ['Todo', 'Última Semana', 'Último Mes', 'Fin de Semana'];
