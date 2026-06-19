import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';

export type PageBuilderViewport = 'desktop' | 'tablet' | 'mobile';

export interface PageBuilderAsset extends BuilderAssetItem {
  description: string;
  datasourceLabel: string;
  viewport: PageBuilderViewport;
}
