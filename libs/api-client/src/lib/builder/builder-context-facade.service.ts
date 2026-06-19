import { computed, inject, Injectable, signal } from '@angular/core';
import { BuilderContext } from '@qo/models';
import { BuilderContextStorageService } from './builder-context-storage.service';

@Injectable({ providedIn: 'root' })
export class BuilderContextFacadeService {
  private readonly storage = inject(BuilderContextStorageService);

  readonly context = signal<BuilderContext | null>(null);
  readonly applicationId = computed(() => this.context()?.applicationId ?? '');
  readonly applicationName = computed(() => this.context()?.applicationName ?? '');
  readonly organisationId = computed(() => this.context()?.organisationId ?? '');

  loadContext(): void {
    this.context.set(this.storage.getContext());
  }

  setContext(context: BuilderContext): void {
    this.context.set(context);
    this.storage.saveContext(context);
  }

  clearContext(): void {
    this.context.set(null);
    this.storage.clearContext();
  }
}
