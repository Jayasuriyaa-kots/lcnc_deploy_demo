import { Injectable } from '@angular/core';
import { DatasourcesWorkspaceService } from '@builder/features/datasources/services/datasources-workspace.service';

export interface IDatasourcesFacade extends DatasourcesWorkspaceService {}

@Injectable({ providedIn: 'root' })
export class DatasourcesFacadeService extends DatasourcesWorkspaceService implements IDatasourcesFacade {}
