export type {
  AccessLogModel,
  UsageEndpointModel,
  UsageMetricModel,
  UsageSourceModel
} from './usage-analytics.model';

export interface UsageSummaryMetric {
  label: string;
  value: string;
  meta: string;
  tone: 'positive' | 'neutral' | 'warning' | 'danger';
}

export interface UsageEndpointRow {
  id: string;
  endpoint: string;
  method: string;
  requests: string;
  latency: string;
  p95: string;
  errorRate: string;
  duplicates: string;
  retryCount: string;
  auth: string;
  access: string;
}

export interface UsageSourceRow {
  id: string;
  organisationId: string;
  source: string;
  application: string;
  type: string;
  availability: string;
  latency: string;
  rpm: string;
  errors: string;
  auth: string;
  jobs: string;
  eps: string;
  dotTone: 'positive' | 'warning' | 'danger';
  availabilityTone: 'positive' | 'warning' | 'danger';
  errorTone: 'positive' | 'warning' | 'danger';
  authTone: 'positive' | 'warning' | 'danger';
  readCount: string;
  writeCount: string;
  endpoints: UsageEndpointRow[];
}
