import { Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { createApplications, createDashboardKpis } from '../mock-data/dashboard.mock';
import { createNotifications } from '../mock-data/notifications.mock';
import { createOrganisations } from '../mock-data/organisations.mock';
import { INVOICES } from '../mock-data/settings.mock';
import { createAuditRecords } from '../mock-data/audit.mock';
import { USER_RECORDS } from '../mock-data/users.mock';

const smokeI18n = {
  translate: (key: string) => key
};
const smokeApplications = createApplications(smokeI18n);
const smokeDashboardKpis = createDashboardKpis(smokeI18n);
const smokeAuditRecords = createAuditRecords(smokeI18n);
const smokeNotifications = createNotifications(smokeI18n);
const smokeOrganisations = createOrganisations(smokeI18n);

export const smokeTestData = {
  application: smokeApplications[0],
  applications: smokeApplications,
  auditRecord: smokeAuditRecords[0],
  auditRecords: smokeAuditRecords,
  invoice: INVOICES[0],
  notifications: smokeNotifications,
  organisation: smokeOrganisations[0],
  organisations: smokeOrganisations,
  user: USER_RECORDS[0],
  users: USER_RECORDS,
  dashboardKpis: smokeDashboardKpis,
  currentPlan: {
    plan: 'Business - Rs 14,999/mo',
    billingCycle: 'Monthly',
    nextInvoice: '1 May 2026',
    paymentMethod: 'Visa ****4242'
  },
  invoiceRows: [
    {
      invoiceNumber: 'INV-2026-004',
      dateRaised: '1 Apr 2026',
      billingPeriod: 'Mar 2026',
      amount: 'Rs 14,999',
      status: 'pending'
    }
  ] as const,
  adminUsers: [
    { initials: 'PS', name: 'Priya Sharma', email: 'priya@acme.co', role: 'Owner' }
  ] as const,
  organisationSummary: [{ label: 'Plan', value: 'Business' }] as const,
  paymentRows: [
    {
      date: '1 Mar 2026',
      reference: 'PAY-20260301-1',
      amount: 'Rs 14,999',
      method: 'Visa ****4242',
      invoice: 'INV-2026-003',
      status: 'full'
    }
  ] as const,
  cumulativeMetrics: [
    {
      label: 'Availability',
      value: '99.7%',
      meta: '2.1h downtime this period',
      tone: 'positive'
    }
  ] as const,
  usageSources: [
    {
      id: 'source-1',
      source: 'PostgreSQL HR',
      application: 'HR Management',
      type: 'SQL',
      availability: '99.9%',
      latency: '88ms',
      rpm: '1,240',
      errors: '0.1%',
      auth: 'OK',
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
          auth: 'OK',
          access: '341'
        }
      ]
    }
  ] as const,
  usageEndpoints: [
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
      auth: 'OK',
      access: '341'
    }
  ] as const,
  userMeta: {
    'u-1': { department: 'HR & Admin', lastLoginDetail: '28 Mar 2026' }
  } as const
};

export async function createSmokeFixture<T>(
  component: Type<T>,
  options: {
    providers?: Provider[];
    inputs?: Record<string, unknown>;
  } = {}
): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [component],
    providers: [provideRouter([]), provideNoopAnimations(), ...(options.providers ?? [])]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);

  for (const [key, value] of Object.entries(options.inputs ?? {})) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();
  return fixture;
}
