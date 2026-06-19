import { ApplicationModel, DashboardKpiModel } from '../pages/dashboard/models';
import type { DeployerI18nService } from '../services/deployer-i18n.service';

type DeployerTranslator = Pick<DeployerI18nService, 'translate'>;

export const createDashboardKpis = (i18n: DeployerTranslator): DashboardKpiModel[] => [
  { label: i18n.translate('dashboard.totalApplications'), value: '8', delta: i18n.translate('mockData.dashboardKpiTotalApplicationsDelta'), tone: 'positive' },
  { label: i18n.translate('dashboard.activeUsers'), value: '426', delta: i18n.translate('mockData.dashboardKpiActiveUsersDelta'), tone: 'positive' },
  { label: i18n.translate('dashboard.dataUsage'), value: '6.4 TB', delta: i18n.translate('mockData.dashboardKpiDataUsageDelta'), tone: 'warning' },
  { label: i18n.translate('dashboard.apiCallVolume'), value: '18.2M', delta: i18n.translate('mockData.dashboardKpiApiCallVolumeDelta'), tone: 'neutral' },
  { label: i18n.translate('dashboard.averageLatency'), value: '214 ms', delta: i18n.translate('mockData.dashboardKpiAverageLatencyDelta'), tone: 'positive' }
];

export const createApplications = (i18n: DeployerTranslator): ApplicationModel[] => [
  {
    id: 'app-1',
    organisationId: 'org-1',
    name: 'Dispatch Command',
    type: i18n.translate('dashboard.applicationTypeOperationsControl'),
    primaryOwner: i18n.translate('dashboard.primaryOwnerPriyaSharma'),
    description: i18n.translate('mockData.appDispatchDescription'),
    superAdminEmails: ['dispatch-admin@northstar.io'],
    adminEmails: ['ops-lead@northstar.io', 'routing-manager@northstar.io'],
    iconLabel: 'DC',
    environment: i18n.translate('mockData.environmentProduction'),
    status: 'live',
    latency: '182 ms',
    lastActivity: '2 min ago',
    users: '184',
    dataUsage: '2.8 TB',
    version: 'v3.8.1',
    healthy: true,
    createdAt: '2026-03-11T08:30:00.000Z'
  },
  {
    id: 'app-2',
    organisationId: 'org-2',
    name: 'Claims Processing Studio',
    type: i18n.translate('dashboard.applicationTypeInternalTool'),
    primaryOwner: i18n.translate('dashboard.primaryOwnerArjunMehta'),
    description: i18n.translate('mockData.appClaimsDescription'),
    superAdminEmails: ['claims-admin@helio.io'],
    adminEmails: ['qa-lead@helio.io'],
    iconLabel: 'CP',
    environment: i18n.translate('mockData.environmentStaging'),
    status: 'warning',
    latency: '346 ms',
    lastActivity: '14 min ago',
    users: '91',
    dataUsage: '912 GB',
    version: 'v2.5.0',
    healthy: true,
    createdAt: '2026-02-20T14:05:00.000Z'
  },
  {
    id: 'app-3',
    organisationId: 'org-4',
    name: 'Retail Edge Insights',
    type: i18n.translate('dashboard.applicationTypeCustomerPortal'),
    primaryOwner: i18n.translate('dashboard.primaryOwnerRinaKapoor'),
    description: i18n.translate('mockData.appRetailDescription'),
    superAdminEmails: ['retail-admin@everforge.io'],
    adminEmails: ['analytics-manager@everforge.io'],
    iconLabel: 'RE',
    environment: i18n.translate('mockData.environmentProduction'),
    status: 'inactive',
    latency: '0 ms',
    lastActivity: 'Yesterday',
    users: '0',
    dataUsage: '0.0 TB',
    version: 'v1.9.4',
    healthy: false,
    createdAt: '2026-01-16T11:20:00.000Z'
  },
  {
    id: 'app-4',
    organisationId: 'org-1',
    name: 'Fleet Signal Hub',
    type: i18n.translate('dashboard.applicationTypeOperationsControl'),
    primaryOwner: i18n.translate('dashboard.primaryOwnerPriyaSharma'),
    description: i18n.translate('mockData.appFleetDescription'),
    superAdminEmails: ['fleet-admin@northstar.io'],
    adminEmails: ['telemetry-lead@northstar.io', 'incident-manager@northstar.io'],
    iconLabel: 'FS',
    environment: i18n.translate('mockData.environmentProduction'),
    status: 'live',
    latency: '228 ms',
    lastActivity: '5 min ago',
    users: '151',
    dataUsage: '1.7 TB',
    version: 'v4.1.0',
    healthy: true,
    createdAt: '2026-04-02T09:10:00.000Z'
  }
];
