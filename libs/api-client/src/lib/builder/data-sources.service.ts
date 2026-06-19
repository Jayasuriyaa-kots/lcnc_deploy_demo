import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DataSource, PaginatedResponse } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class DataSourcesService {
  private mockData: DataSource[] = [
    { id: 'ds_1', name: 'Production DB', type: 'postgres', status: 'connected', appId: 'app_1', config: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastPingMs: 42 },
    { id: 'ds_2', name: 'Stripe API', type: 'stripe', status: 'connected', appId: 'app_1', config: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastPingMs: 120 },
    { id: 'ds_3', name: 'Legacy CRM', type: 'rest', status: 'error', appId: 'app_1', config: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  getDataSources(appId: string): Observable<DataSource[]> {
    return of(this.mockData.filter(ds => ds.appId === appId)).pipe(delay(400));
  }
}
