import { computed, Injectable, inject, signal } from '@angular/core';
import { OrganisationsFacadeService } from '../../../core/layout/services/organisations-facade.service';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { UsageSourceRow, UsageSummaryMetric } from '../models';

@Injectable({ providedIn: 'root' })
export class UsageFacadeService {
  private readonly organisationsFacade = inject(OrganisationsFacadeService);
  private readonly i18n = inject(DeployerI18nService);

  readonly filters = signal([
    this.i18n.translate('usage.filterLast30Days'),
    this.i18n.translate('usage.filterAllApplications'),
    this.i18n.translate('usage.filterExportCsv')
  ] as const);
  readonly selectedOrganisation = this.organisationsFacade.selectedOrganisation;
  readonly sourceRows = signal<readonly UsageSourceRow[]>([
    {
      id: 'source-1',
      organisationId: 'org-1',
      source: 'PostgreSQL HR',
      application: 'Northstar Workforce',
      type: 'SQL',
      availability: '99.7%',
      latency: '142ms',
      rpm: '1,240',
      errors: '0.4%',
      auth: this.i18n.translate('usage.authOk'),
      jobs: '12/12',
      eps: '14',
      dotTone: 'positive',
      availabilityTone: 'positive',
      errorTone: 'positive',
      authTone: 'positive',
      readCount: '10',
      writeCount: '4',
      endpoints: [
        {
          id: 'pg-1',
          endpoint: 'GET /employees',
          method: 'GET',
          requests: '9,241',
          latency: '88ms',
          p95: '210ms',
          errorRate: '0.1%',
          duplicates: '0',
          retryCount: '12',
          auth: this.i18n.translate('usage.authOk'),
          access: '341'
        },
        {
          id: 'pg-2',
          endpoint: 'POST /employees',
          method: 'POST',
          requests: '1,820',
          latency: '142ms',
          p95: '380ms',
          errorRate: '0.4%',
          duplicates: '8',
          retryCount: '24',
          auth: this.i18n.translate('usage.authOk'),
          access: '82'
        }
      ]
    },
    {
      id: 'source-2',
      organisationId: 'org-1',
      source: 'Fleet Routing API',
      application: 'Dispatch Command',
      type: 'REST',
      availability: '98.4%',
      latency: '228ms',
      rpm: '2,180',
      errors: '1.2%',
      auth: this.i18n.translate('usage.authExpired'),
      jobs: '8/10',
      eps: '6',
      dotTone: 'warning',
      availabilityTone: 'warning',
      errorTone: 'warning',
      authTone: 'danger',
      readCount: '4',
      writeCount: '2',
      endpoints: [
        {
          id: 'rest-1',
          endpoint: 'GET /shipments',
          method: 'GET',
          requests: '6,420',
          latency: '220ms',
          p95: '410ms',
          errorRate: '1.2%',
          duplicates: '3',
          retryCount: '46',
          auth: this.i18n.translate('usage.authOk'),
          access: '188'
        }
      ]
    },
    {
      id: 'source-3',
      organisationId: 'org-2',
      source: 'Helio Payments Core',
      application: 'Claims Processing Studio',
      type: 'REST',
      availability: '99.1%',
      latency: '184ms',
      rpm: '1,860',
      errors: '0.7%',
      auth: this.i18n.translate('usage.authOk'),
      jobs: '9/10',
      eps: '11',
      dotTone: 'positive',
      availabilityTone: 'positive',
      errorTone: 'positive',
      authTone: 'positive',
      readCount: '8',
      writeCount: '3',
      endpoints: [
        {
          id: 'helio-1',
          endpoint: 'GET /claims',
          method: 'GET',
          requests: '4,120',
          latency: '184ms',
          p95: '320ms',
          errorRate: '0.7%',
          duplicates: '2',
          retryCount: '18',
          auth: this.i18n.translate('usage.authOk'),
          access: '144'
        }
      ]
    },
    {
      id: 'source-4',
      organisationId: 'org-3',
      source: 'Axis Integration Hub',
      application: 'Care Access Portal',
      type: 'OAuth',
      availability: '97.8%',
      latency: '304ms',
      rpm: '920',
      errors: '2.1%',
      auth: this.i18n.translate('usage.authRefresh'),
      jobs: '5/6',
      eps: '4',
      dotTone: 'danger',
      availabilityTone: 'warning',
      errorTone: 'danger',
      authTone: 'warning',
      readCount: '3',
      writeCount: '1',
      endpoints: [
        {
          id: 'axis-1',
          endpoint: 'GET /patients',
          method: 'GET',
          requests: '1,240',
          latency: '304ms',
          p95: '510ms',
          errorRate: '2.1%',
          duplicates: '4',
          retryCount: '31',
          auth: this.i18n.translate('usage.authRefresh'),
          access: '53'
        }
      ]
    },
    {
      id: 'source-5',
      organisationId: 'org-4',
      source: 'Retail Sync Sheets',
      application: 'Retail Edge Insights',
      type: 'OAuth',
      availability: '98.6%',
      latency: '126ms',
      rpm: '780',
      errors: '0.3%',
      auth: this.i18n.translate('usage.authOk'),
      jobs: '7/7',
      eps: '5',
      dotTone: 'positive',
      availabilityTone: 'positive',
      errorTone: 'positive',
      authTone: 'positive',
      readCount: '5',
      writeCount: '1',
      endpoints: [
        {
          id: 'retail-1',
          endpoint: 'GET /inventory',
          method: 'GET',
          requests: '2,540',
          latency: '126ms',
          p95: '240ms',
          errorRate: '0.3%',
          duplicates: '1',
          retryCount: '7',
          auth: this.i18n.translate('usage.authOk'),
          access: '76'
        }
      ]
    }
  ]);
  readonly selectedOrganisationSourceRows = computed(() => {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      return [];
    }

    return this.sourceRows().filter((row) => row.organisationId === selectedOrganisationId);
  });
  readonly summaryMetrics = computed<readonly UsageSummaryMetric[]>(() => {
    const sources = this.selectedOrganisationSourceRows();
    const rpmTotal = sources.reduce((sum, source) => sum + this.parseInteger(source.rpm), 0);
    const averageAvailability = this.averagePercentage(
      sources.map((source) => source.availability)
    );
    const averageLatency = this.averageWholeNumber(sources.map((source) => source.latency));
    const averageErrors = this.averagePercentage(sources.map((source) => source.errors));
    const authIssues = sources.filter((source) => source.auth !== this.i18n.translate('usage.authOk')).length;
    const endpointCount = sources.reduce((sum, source) => sum + source.endpoints.length, 0);
    const totalRetries = sources.reduce(
      (sum, source) =>
        sum +
        source.endpoints.reduce(
          (endpointSum, endpoint) => endpointSum + this.parseInteger(endpoint.retryCount),
          0
        ),
      0
    );
    const totalAccess = sources.reduce(
      (sum, source) =>
        sum +
        source.endpoints.reduce(
          (endpointSum, endpoint) => endpointSum + this.parseInteger(endpoint.access),
          0
        ),
      0
    );

    return [
      {
        label: this.i18n.translate('usage.metricAvailability'),
        value: `${averageAvailability.toFixed(1)}%`,
        meta: this.i18n.translate('usage.metricAvailabilityMeta', { count: sources.length }),
        tone: averageAvailability >= 99 ? 'positive' : 'warning'
      },
      {
        label: this.i18n.translate('usage.metricLatencyP50'),
        value: `${averageLatency}ms`,
        meta: this.i18n.translate('usage.metricLatencyP50Meta', { count: endpointCount }),
        tone: averageLatency <= 180 ? 'positive' : 'neutral'
      },
      {
        label: this.i18n.translate('usage.metricThroughput'),
        value: `${rpmTotal.toLocaleString()} RPM`,
        meta: this.i18n.translate('usage.metricThroughputMeta', { count: sources.length }),
        tone: 'neutral'
      },
      {
        label: this.i18n.translate('usage.metricRateLimit'),
        value: `${Math.min(68 + sources.length * 4, 96)}%`,
        meta: this.i18n.translate('usage.metricRateLimitMeta', { quota: Math.max(rpmTotal + 1200, 2400).toLocaleString() }),
        tone: rpmTotal > 4000 ? 'warning' : 'neutral'
      },
      {
        label: this.i18n.translate('usage.metricAuthStatus'),
        value: authIssues.toString(),
        meta: authIssues === 0
          ? this.i18n.translate('usage.metricAuthNoIssues')
          : this.i18n.translate('usage.metricAuthNeedsAttention', { count: authIssues }),
        tone: authIssues === 0 ? 'positive' : 'danger'
      },
      {
        label: this.i18n.translate('usage.metricErrorRate'),
        value: `${averageErrors.toFixed(1)}%`,
        meta: this.i18n.translate('usage.metricErrorRateMeta', { count: endpointCount }),
        tone: averageErrors < 1 ? 'positive' : 'warning'
      },
      {
        label: this.i18n.translate('usage.metricDuplicates'),
        value: sources
          .reduce(
            (sum, source) =>
              sum +
              source.endpoints.reduce(
                (endpointSum, endpoint) => endpointSum + this.parseInteger(endpoint.duplicates),
                0
              ),
            0
          )
          .toString(),
        meta: this.i18n.translate('usage.metricDuplicatesMeta'),
        tone: 'neutral'
      },
      {
        label: this.i18n.translate('usage.metricJobSuccess'),
        value: this.jobSuccessRate(sources),
        meta: this.i18n.translate('usage.metricJobSuccessMeta', {
          count: sources.filter((source) => !source.jobs.startsWith('0/')).length,
        }),
        tone: 'positive'
      },
      {
        label: this.i18n.translate('usage.metricRetryAttempts'),
        value: totalRetries.toString(),
        meta: this.i18n.translate('usage.metricRetryAttemptsMeta'),
        tone: 'neutral'
      },
      {
        label: this.i18n.translate('usage.metricAccessLogs'),
        value: totalAccess.toLocaleString(),
        meta: this.i18n.translate('usage.metricAccessLogsMeta'),
        tone: 'neutral'
      }
    ];
  });
  readonly expandedSourceId = signal<string | null>(null);

  private parseInteger(value: string): number {
    const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private parsePercentage(value: string): number {
    const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ''));

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private averagePercentage(values: string[]): number {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + this.parsePercentage(value), 0);

    return total / values.length;
  }

  private averageWholeNumber(values: string[]): number {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + this.parseInteger(value), 0);

    return Math.round(total / values.length);
  }

  private jobSuccessRate(sources: readonly UsageSourceRow[]): string {
    const jobTotals = sources.reduce(
      (accumulator, source) => {
        const [successfulJobs, totalJobs] = source.jobs.split('/').map((value) => this.parseInteger(value));

        return {
          successful: accumulator.successful + successfulJobs,
          total: accumulator.total + totalJobs
        };
      },
      { successful: 0, total: 0 }
    );

    if (jobTotals.total === 0) {
      return '0%';
    }

    return `${((jobTotals.successful / jobTotals.total) * 100).toFixed(1)}%`;
  }
}
