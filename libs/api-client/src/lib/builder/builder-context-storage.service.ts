import { Injectable } from '@angular/core';
import { BuilderContext } from '@qo/models';

const BUILDER_CONTEXT_STORAGE_KEY = 'qo_builder_context';

@Injectable({ providedIn: 'root' })
export class BuilderContextStorageService {
  getContext(): BuilderContext | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    try {
      const rawContext = storage.getItem(BUILDER_CONTEXT_STORAGE_KEY);

      if (!rawContext) {
        return null;
      }

      return JSON.parse(rawContext) as BuilderContext;
    } catch {
      return null;
    }
  }

  saveContext(context: BuilderContext): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      storage.setItem(BUILDER_CONTEXT_STORAGE_KEY, JSON.stringify(context));
    } catch {
      // Ignore storage write failures so the UI can continue in memory.
    }
  }

  clearContext(): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      storage.removeItem(BUILDER_CONTEXT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures so the UI can continue in memory.
    }
  }

  private getStorage(): Storage | null {
    return typeof globalThis === 'undefined' ? null : globalThis.localStorage ?? null;
  }
}
