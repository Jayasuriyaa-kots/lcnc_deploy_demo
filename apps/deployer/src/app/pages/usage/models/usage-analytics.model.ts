export type UsageMetricTone = 'positive' | 'neutral' | 'warning';
export type UsageHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

export interface UsageMetricModel {
  label: string;
  value: string;
  delta: string;
  tone?: UsageMetricTone;
}

export interface UsageEndpointModel {
  id: string;
  endpoint: string;
  method: UsageHttpMethod;
  latency: string;
  uptime: string;
  throughput: string;
  errorRate: string;
  retryCount: string;
  requests: string;
}

export interface UsageSourceModel {
  id: string;
  source: string;
  records: string;
  throughput: string;
  health: 'healthy' | 'degraded';
  owner: string;
  refreshWindow: string;
  endpoints: UsageEndpointModel[];
}

export interface AccessLogModel {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  endpoint: string;
  result: string;
  detail: string;
}
