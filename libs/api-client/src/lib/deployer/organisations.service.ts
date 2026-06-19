import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Organisation, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class OrganisationsService {
  private mockData: Organisation[] = [
    { id: 'org_1', name: 'Acme Corp', slug: 'acme-corp', plan: 'enterprise', status: 'active', createdAt: '2025-01-10T10:00:00Z', memberCount: 45, appCount: 3 },
    { id: 'org_2', name: 'Stark Industries', slug: 'stark-ind', plan: 'pro', status: 'active', createdAt: '2025-02-15T14:30:00Z', memberCount: 12, appCount: 1 },
    { id: 'org_3', name: 'Wayne Enterprises', slug: 'wayne-ent', plan: 'pro', status: 'suspended', createdAt: '2025-03-01T09:15:00Z', memberCount: 8, appCount: 2 },
    { id: 'org_4', name: 'Umbrella Corp', slug: 'umbrella', plan: 'free', status: 'active', createdAt: '2025-04-05T11:45:00Z', memberCount: 2, appCount: 1 },
  ];

  getOrganisations(page = 1, pageSize = 10, search = ''): Observable<PaginatedResponse<Organisation>> {
    let data = this.mockData;
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(org => org.name.toLowerCase().includes(lowerSearch) || org.slug.toLowerCase().includes(lowerSearch));
    }
    
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);
    
    return of({
      data: paginatedData,
      total,
      page,
      pageSize
    }).pipe(delay(400));
  }

  getOrganisation(id: string): Observable<Organisation> {
    const org = this.mockData.find(o => o.id === id);
    if (!org) throw new Error('Not found');
    return of(org).pipe(delay(300));
  }
}
