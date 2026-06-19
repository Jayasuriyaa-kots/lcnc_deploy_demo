import { Injectable, signal } from '@angular/core';
import { WorkflowSectionId } from '../models/workflow-builder-nav.model';

type SearchState = Record<WorkflowSectionId, string>;

@Injectable({ providedIn: 'root' })
export class WorkflowSearchStateService {
  readonly searchBySection = signal<SearchState>({
    'form-actions': '',
    events: '',
    scheduler: '',
    'action-buttons': '',
    functions: '',
  });

  get(section: WorkflowSectionId): string {
    return this.searchBySection()[section];
  }

  set(section: WorkflowSectionId, query: string): void {
    this.searchBySection.update((current) => ({
      ...current,
      [section]: query,
    }));
  }
}
