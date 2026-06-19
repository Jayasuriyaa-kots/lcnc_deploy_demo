import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DashboardMetrics, Invoice, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getMetrics(): Observable<DashboardMetrics> {
    return of({
      totalOrganisations: 142,
      activeUsers: 893,
      totalApps: 320,
      apiRequestsToday: 1542000,
      revenueThisMonth: 42500
    }).pipe(delay(500));
  }
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private mockInvoices: Invoice[] = [
    { id: 'inv_1001', organisationId: 'org_1', amount: 499.00, status: 'paid', date: '2025-04-01T00:00:00Z' },
    { id: 'inv_1002', organisationId: 'org_1', amount: 499.00, status: 'paid', date: '2025-03-01T00:00:00Z' },
    { id: 'inv_1003', organisationId: 'org_2', amount: 99.00, status: 'pending', date: '2025-04-05T00:00:00Z' },
  ];

  getInvoices(page = 1, pageSize = 10, orgId?: string): Observable<PaginatedResponse<Invoice>> {
    let data = this.mockInvoices;
    if (orgId) {
      data = data.filter(i => i.organisationId === orgId);
    }
    return of({
      data: data.slice((page - 1) * pageSize, page * pageSize),
      total: data.length,
      page,
      pageSize
    }).pipe(delay(400));
  }
}
