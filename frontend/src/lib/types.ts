// ==========================================
// PDM Industrial App - TypeScript Types
// ==========================================

export type PumpStatus = 'Operational' | 'Under Maintenance' | 'Decommissioned';
export type MaintenanceRequired = 'Yes' | 'No';

export interface Pump {
  id: number;
  name: string;
  location: string;
  installation_date: string;
  status: PumpStatus;
  prediction_log?: PumpPredictionLog[];
}

export interface PumpCreateRequest {
  name: string;
  location: string;
}

export interface PumpPredictionLog {
  id: number;
  pump_id: number;
  temperature: number;
  vibration: number;
  pressure: number;
  flow_rate: number;
  rpm: number;
  operational_hours: number;
  maintenance_required: MaintenanceRequired;
  confidence_score: number;
  created_at: string;
}

export interface PredictionLogCreateRequest {
  pump_id: number;
  temperature: number;
  vibration: number;
  pressure: number;
  flow_rate: number;
  rpm: number;
  operational_hours: number;
}

export interface PredictionFactorDetail {
  status: string;
  value: number;
  threshold: number;
  reason: string;
}

export interface PredictionScoreDetail {
  score: number;
  threshold: number;
  triggered: boolean;
}

export interface PredictionDetails {
  factor_details: Record<string, PredictionFactorDetail>;
  score_breakdown: Record<string, PredictionScoreDetail>;
}

export interface PredictionResponse {
  maintenance_required: string;
  confidence_score: number;
  details?: PredictionDetails;
}

export interface ApiError {
  detail: string;
}
