import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Page } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class PagesService {
  private mockData: Page[] = [
    { 
      id: 'pg_1', name: 'Home Dashboard', slug: 'home', appId: 'app_1', 
      layout: { id: 'root', type: 'col', children: [ { id: 'c1', type: 'metric' }, { id: 'c2', type: 'table' } ] },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() 
    }
  ];

  getPages(appId: string): Observable<Page[]> {
    return of(this.mockData.filter(p => p.appId === appId)).pipe(delay(300));
  }
}
