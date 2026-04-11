import {
  Pump,
  PumpCreateRequest,
  PumpPredictionLog,
  PredictionLogCreateRequest,
  PredictionResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // ==================== Health ====================
  async healthCheck() {
    return this.request<{ Message: string }>('/');
  }

  // ==================== Pumps ====================
  async listPumps(): Promise<Pump[]> {
    return this.request<Pump[]>('/pumps');
  }

  async getPump(id: number): Promise<Pump> {
    return this.request<Pump>(`/pumps/${id}`);
  }

  async createPump(data: PumpCreateRequest): Promise<Pump> {
    return this.request<Pump>('/pumps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePumpStatus(id: number, status: string): Promise<Pump> {
    return this.request<Pump>(`/pumps/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    });
  }

  // ==================== Predictions ====================
  async predictMaintenance(data: PredictionLogCreateRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/api/v1/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Prediction Logs ====================
  async getPumpPredictionLogs(pumpId: number): Promise<PumpPredictionLog[]> {
    return this.request<PumpPredictionLog[]>(`/pumps/${pumpId}/prediction-logs`);
  }

  async getAllPredictionLogs(pumpId?: number): Promise<PumpPredictionLog[]> {
    const query = pumpId ? `?pump_id=${pumpId}` : '';
    return this.request<PumpPredictionLog[]>(`/prediction-logs${query}`);
  }
}

export const apiClient = new ApiClient(API_BASE);
