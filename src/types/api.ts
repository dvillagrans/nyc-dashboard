import type { FarePredictionRequest, FarePredictionResponse, AirportClassificationRequest, AirportClassificationResponse, ModelInfo, FeatureImportance } from './data';

export interface ModelsResponse {
  models: ModelInfo[];
}

export type { FarePredictionRequest, FarePredictionResponse, AirportClassificationRequest, AirportClassificationResponse, FeatureImportance };
