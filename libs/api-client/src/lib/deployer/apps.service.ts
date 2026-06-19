import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { App, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class AppsService {
  private mockData: App[] = [
    { id: 'app_1', name: 'Customer Portal', slug: 'customer-portal', description: 'Main B2B portal', organisationId: 'org_1', status: 'production', createdAt: '2025-01-15T00:00:00Z', updatedAt: new Date().toISOString() },
    { id: 'app_2', name: 'Internal Admin', slug: 'internal-admin', description: 'Internal tools', organisationId: 'org_1', status: 'development', createdAt: '2025-02-01T00:00:00Z', updatedAt: new Date().toISOString() },
    { id: 'app_3', name: 'Jarvis Dashboard', slug: 'jarvis', organisationId: 'org_2', status: 'production', createdAt: '2025-03-01T00:00:00Z', updatedAt: new Date().toISOString() },
  ];

  getApps(page = 1, pageSize = 10, search = '', orgId?: string): Observable<PaginatedResponse<App>> {
    let data = this.mockData;
    if (orgId) data = data.filter(a => a.organisationId === orgId);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(a => a.name.toLowerCase().includes(s) || a.slug.toLowerCase().includes(s));
    }
    
    const total = data.length;
    return of({
      data: data.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize
    }).pipe(delay(400));
  }
}
