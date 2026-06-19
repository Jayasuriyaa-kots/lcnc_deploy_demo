export interface DeploymentToggle {
  id: string;
  label: string;
  checked: boolean;
}

export interface NavigationPage {
  id: string;
  label: string;
  icon: string;
  tone: 'blue' | 'green' | 'purple';
}

export interface PageGroup {
  main: NavigationPage;
  children: LeftPageGroup[];
  note?: string;
}

export interface LeftPageGroup {
  page: NavigationPage;
  subPages: NavigationPage[];
  note?: string;
}

export interface TopPageGroup {
  source: NavigationPage;
  tabs: NavigationPage[];
}

export interface WorkspaceType {
  id: string;
  title: string;
  icon: string;
  description: string;
  active: boolean;
}

export interface DeploymentEnvironment {
  id: string;
  name: string;
  url: string;
  status: string;
  users: string;
}

export interface FooterButton {
  id: string;
  label: string;
  type: 'custom' | 'export';
}

export interface PreviewDataset {
  columns: string[];
  rows: string[][];
}

export interface PreviewFilters {
  activeOnly: boolean;
  department: string;
  joinedFrom: string;
  joinedTo: string;
  newJoinersOnly: boolean;
  onLeaveOnly: boolean;
}

export interface DeploymentTheme {
  borderColor: string;
  footerBg: string;
  footerText: string;
  headerBg: string;
  headerText: string;
  hoverBg: string;
  navActiveBg: string;
  navActiveText: string;
  navBg: string;
  navText: string;
  primaryColor: string;
  secondaryColor: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  sidebarBg: string;
  sidebarText: string;
  textPrimary: string;
  textSecondary: string;
  workspaceBg: string;
}

export interface WorkflowExecutionStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
}

export interface PageTarget {
  assetId: string;
  assetType: 'report' | 'page' | 'form';
}

export type DeploymentRuntimeMode = 'preview' | 'deployed';
export type DeploymentSaveState = 'idle' | 'saving' | 'saved';
export type PreviewSortMode = 'name-asc' | 'name-desc' | 'joined-desc' | 'department';
export type PreviewViewMode = 'grid' | 'list';
export type ShowcaseModule = 'forms' | 'reports' | 'pages';
