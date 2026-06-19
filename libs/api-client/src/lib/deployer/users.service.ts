import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PlatformUser, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private mockData: PlatformUser[] = [
    { id: 'usr_1', email: 'admin@acme.com', firstName: 'Alice', lastName: 'Smith', role: 'admin', status: 'active', lastActiveAt: new Date().toISOString(), organisationId: 'org_1' },
    { id: 'usr_2', email: 'bob@acme.com', firstName: 'Bob', lastName: 'Jones', role: 'member', status: 'active', lastActiveAt: new Date(Date.now() - 86400000).toISOString(), organisationId: 'org_1' },
    { id: 'usr_3', email: 'charlie@stark.com', firstName: 'Charlie', lastName: 'Brown', role: 'admin', status: 'invited', lastActiveAt: '', organisationId: 'org_2' },
  ];

  getUsers(page = 1, pageSize = 10, search = '', orgId?: string): Observable<PaginatedResponse<PlatformUser>> {
    let data = this.mockData;
    if (orgId) {
      data = data.filter(u => u.organisationId === orgId);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      data = data.filter(u => u.email.toLowerCase().includes(lowerSearch) || u.firstName.toLowerCase().includes(lowerSearch));
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
}
