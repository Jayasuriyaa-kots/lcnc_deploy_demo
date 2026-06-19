import { AccessLogModel, UsageMetricModel, UsageSourceModel } from '../pages/usage/models';
import type { DeployerI18nService } from '../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createUsageMetrics = (i18n: DeployerTranslator): UsageMetricModel[] => [
  { label: i18n.translate('usage.mockRequestsProcessed'), value: '18.2M', delta: '+9.4%', tone: 'positive' },
  { label: i18n.translate('usage.mockAvgResponseLatency'), value: '214 ms', delta: '-12 ms', tone: 'positive' },
  { label: i18n.translate('usage.mockHealthyEndpoints'), value: '97.8%', delta: '+0.6%', tone: 'positive' },
  { label: i18n.translate('usage.mockErrorPressure'), value: '0.42%', delta: '-0.08%', tone: 'positive' },
  { label: i18n.translate('usage.mockRetriesExecuted'), value: '14,220', delta: '+3.1%', tone: 'warning' },
  { label: i18n.translate('usage.mockDataFreshness'), value: '4 min', delta: i18n.translate('usage.mockWithinSla'), tone: 'neutral' }
];
export const USAGE_SOURCES: UsageSourceModel[] = [
  {
    id: 'source-1',
    source: 'Warehouse Sync',
    records: '6.4M',
    throughput: '72.8k/min',
    health: 'healthy',
    owner: 'Platform Integrations',
    refreshWindow: 'Every 5 minutes',
    endpoints: [
      {
        id: 'e-1',
        endpoint: '/inventory/pull',
        method: 'GET',
        latency: '188 ms',
        uptime: '99.98%',
        throughput: '31.2k/min',
        errorRate: '0.22%',
        retryCount: '182',
        requests: '3.2M'
      },
      {
        id: 'e-2',
        endpoint: '/orders/publish',
        method: 'POST',
        latency: '204 ms',
        uptime: '99.95%',
        throughput: '18.4k/min',
        errorRate: '0.31%',
        retryCount: '246',
        requests: '1.8M'
      }
    ]
  },
  {
    id: 'source-2',
    source: 'Claims API',
    records: '2.7M',
    throughput: '28.4k/min',
    health: 'degraded',
    owner: 'Claims Operations',
    refreshWindow: 'Every 15 minutes',
    endpoints: [
      {
        id: 'e-3',
        endpoint: '/claims/intake',
        method: 'POST',
        latency: '336 ms',
        uptime: '99.41%',
        throughput: '12.8k/min',
        errorRate: '1.12%',
        retryCount: '1,204',
        requests: '1.2M'
      },
      {
        id: 'e-4',
        endpoint: '/claims/status',
        method: 'GET',
        latency: '281 ms',
        uptime: '99.62%',
        throughput: '9.7k/min',
        errorRate: '0.74%',
        retryCount: '628',
        requests: '944k'
      }
    ]
  },
  {
    id: 'source-3',
    source: 'Fleet Telemetry',
    records: '4.1M',
    throughput: '44.2k/min',
    health: 'healthy',
    owner: 'Mobility Systems',
    refreshWindow: 'Every 3 minutes',
    endpoints: [
      {
        id: 'e-5',
        endpoint: '/telemetry/ingest',
        method: 'PUT',
        latency: '226 ms',
        uptime: '99.92%',
        throughput: '21.6k/min',
        errorRate: '0.29%',
        retryCount: '312',
        requests: '2.4M'
      },
      {
        id: 'e-6',
        endpoint: '/telemetry/snapshot',
        method: 'GET',
        latency: '164 ms',
        uptime: '99.97%',
        throughput: '13.3k/min',
        errorRate: '0.14%',
        retryCount: '88',
        requests: '1.1M'
      }
    ]
  }
];
export const ACCESS_LOGS: AccessLogModel[] = [
  {
    id: 'l-1',
    timestamp: '2026-04-06 10:42',
    actor: 'Maya Bennett',
    action: 'CSV export',
    endpoint: '/usage/export',
    result: 'Success',
    detail: 'Downloaded a 30-day usage snapshot for Northstar Logistics.'
  },
  {
    id: 'l-2',
    timestamp: '2026-04-06 10:34',
    actor: 'System',
    action: 'Aggregation job',
    endpoint: '/jobs/usage-refresh',
    result: 'Completed',
    detail: 'Rebuilt source and endpoint aggregates across 18.2M events.'
  },
  {
    id: 'l-3',
    timestamp: '2026-04-06 10:19',
    actor: 'Rohan Iyer',
    action: 'Endpoint drill-down',
    endpoint: '/usage/endpoints',
    result: 'Viewed',
    detail: 'Inspected error pressure and retry count for Claims API.'
  },
  {
    id: 'l-4',
    timestamp: '2026-04-06 09:58',
    actor: 'System',
    action: 'Alert threshold',
    endpoint: '/claims/intake',
    result: 'Raised',
    detail: 'Error rate crossed 1.0% and triggered degraded-state monitoring.'
  }
];
