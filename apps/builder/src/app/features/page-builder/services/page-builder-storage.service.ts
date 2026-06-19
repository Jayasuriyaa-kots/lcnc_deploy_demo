import { Injectable } from '@angular/core';
import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';
import { injectBrowserStorage } from '@builder/core/services/browser-storage.service';
import { CanvasWidget } from '@builder/features/page-builder/models/page-builder-canvas.model';

@Injectable({ providedIn: 'root' })
export class PageBuilderStorageService {
  private readonly storage = injectBrowserStorage();

  readWidgets(storageKey: string): CanvasWidget[] {
    const value = this.storage.getJson<CanvasWidget[]>(storageKey);
    return Array.isArray(value) ? value : [];
  }

  persist(storageKey: string, widgets: CanvasWidget[]): void {
    this.storage.setJson(storageKey, widgets);
  }

  remove(storageKey: string): void {
    this.storage.remove(storageKey);
  }

  persistPages<T extends BuilderAssetItem>(storageKey: string, pages: T[]): void {
    this.storage.setJson(
      storageKey,
      pages.map(({ shortCode: _shortCode, ...page }) => page),
    );
  }

  persistSelectedPageId(storageKey: string, pageId: string | null): void {
    if (!pageId) {
      this.storage.remove(storageKey);
      return;
    }

    this.storage.setString(storageKey, pageId);
  }

  readWidgetsForPage(
    storageKey: string,
    pageId: string,
    pageIds: string[],
  ): CanvasWidget[] {
    const pageStorageKey = this.getPageStorageKey(storageKey, pageId);
    if (this.hasStoredValue(pageStorageKey)) {
      return this.readWidgets(pageStorageKey);
    }

    if (this.hasAnyPageScopedWidgets(storageKey, pageIds)) {
      return [];
    }

    const legacyWidgets = this.readWidgets(storageKey);
    if (!legacyWidgets.length) {
      return [];
    }

    this.persist(pageStorageKey, legacyWidgets);
    return legacyWidgets;
  }

  hasAnyPageScopedWidgets(storageKey: string, pageIds: string[]): boolean {
    return pageIds.some((pageId) => this.hasStoredValue(this.getPageStorageKey(storageKey, pageId)));
  }

  hasStoredValue(storageKey: string): boolean {
    return this.storage.getString(storageKey) !== null;
  }

  getPageStorageKey(storageKey: string, pageId: string): string {
    return `${storageKey}:${pageId}`;
  }

  loadPagesState<TStored extends BuilderAssetItem, TMapped>(
    storageKey: string,
    fallbackPages: BuilderAssetItem[],
    normalizePageAsset: (page: TStored | BuilderAssetItem) => TMapped,
  ): TMapped[] {
    const storedPages = this.storage.getJson<TStored[]>(storageKey);
    if (Array.isArray(storedPages) && storedPages.length > 0) {
      return storedPages.map((page) => normalizePageAsset(page));
    }

    return fallbackPages.map((page) => normalizePageAsset(page));
  }

  loadSelectedPageId(storageKey: string): string | null {
    return this.storage.getString(storageKey);
  }
}
