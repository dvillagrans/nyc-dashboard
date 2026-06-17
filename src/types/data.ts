export interface TripRecord {
  pickup_datetime: number;
  dropoff_datetime?: number;
  hvfhs_license_num: string;
  PULocationID: number;
  DOLocationID: number;
  tips: number;
  driver_pay: number;
  trip_miles?: number;
  trip_time?: number;
  base_passenger_fare?: number;
  tolls?: number;
  bcf?: number;
  sales_tax?: number;
  congestion_surcharge?: number;
  airport_fee?: number;
  pickup_hour: number;
  pickup_weekday: number;
  pickup_month: number;
  day_name: string;
  pickup_date?: string;
  pickup_zone?: string;
  pickup_borough?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_zone?: string;
  dropoff_borough?: number;
  from_airport: boolean;
  to_airport: boolean;
}

export interface ZoneInfo {
  LocationID: number;
  Borough: string;
  Zone: string;
  service_zone: string;
  latitude: number;
  longitude: number;
}

export interface GlobalFilters {
  selectedMonth: string;
  selectedOperators: string[];
  hourRange: [number, number];
  selectedBoroughs: string[];
  airportOnly: boolean;
}

export interface FilterSummary {
  totalRecords: number;
  filteredRecords: number;
  availableMonths: string[];
  availableOperators: string[];
  availableBoroughs: string[];
}

// ML API types
export interface FarePredictionRequest {
  trip_miles: number;
  trip_time: number;
  pickup_hour: number;
  pickup_weekday: number;
  company: string;
  model_name: string;
}

export interface FarePredictionResponse {
  predicted_fare: number;
  model_used: string;
  model_type: string;
}

export interface AirportClassificationRequest {
  trip_miles: number;
  trip_time: number;
  pickup_hour: number;
  company: string;
}

export interface AirportClassificationResponse {
  is_airport: boolean;
  confidence: number;
}

export interface ModelInfo {
  name: string;
  type: 'joblib' | 'neural_network';
  performance?: number;
  metrics?: Record<string, number>;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

// Chart data types
export interface PieDatum {
  name: string;
  value: number;
  percentage?: number;
}

export interface HeatmapDatum {
  x: number;
  y: number;
  value: number;
}

export interface BoxPlotDatum {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}
