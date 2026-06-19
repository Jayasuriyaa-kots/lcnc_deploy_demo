import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Workflow, Role } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  getRoles(appId: string): Observable<Role[]> {
    return of([
      { id: 'rol_1', name: 'Admin', appId, description: 'Full access', permissions: ['*'] },
      { id: 'rol_2', name: 'Viewer', appId, description: 'Read only', permissions: ['read'] }
    ]).pipe(delay(300));
  }
}
