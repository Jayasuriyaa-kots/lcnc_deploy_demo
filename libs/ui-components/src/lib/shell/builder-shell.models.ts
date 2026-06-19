export interface BuilderModuleLink {
  id: string;
  label: string;
  route: string;
}

export interface BuilderAssetItem {
  id: string;
  shortCode: string;
  name: string;
  typeLabel: string;
  status: 'live' | 'draft';
}

export type BuilderAssetStatus = BuilderAssetItem['status'];

export interface BuilderSidebarTab {
  id: string;
  label: string;
  icon: string;
  route?: string;
}

export interface BuilderSidebarPaletteItem {
  id: string;
  label: string;
  icon: string;
}

export interface BuilderModuleConfig {
  id: string;
  label: string;
  route: string;
  sidebarTitle: string;
  sidebarMode?: 'list' | 'tabs' | 'palette';
  actionLabel: string;
  searchPlaceholder: string;
  items: BuilderAssetItem[];
  tabs?: BuilderSidebarTab[];
  paletteItems?: BuilderSidebarPaletteItem[];
}
