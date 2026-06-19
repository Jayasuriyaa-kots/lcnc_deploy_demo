// ─────────────────────────────────────────────────────────────────────────────
// Runtime JSON Schema — complete type system for the JSON-driven platform
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ────────────────────────────────────────────────────────

export type ToneColor = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'neutral';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

// ── Branding & Theme ─────────────────────────────────────────────────────────

export interface BrandingConfig {
  companyName: string;
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
}

export interface ThemeConfig {
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

// ── Navigation ───────────────────────────────────────────────────────────────

export interface NavTopTab {
  id: string;
  label: string;
  icon: string;
  tone: ToneColor;
  pageTargetId?: string;   // pre-wired report/page/form asset ID
  pageTargetType?: 'report' | 'page' | 'form';
}

export interface NavSubPage {
  id: string;
  label: string;
  icon: string;
  tone: ToneColor;
  topTabs?: NavTopTab[];
  pageTargetId?: string;
  pageTargetType?: 'report' | 'page' | 'form';
}

export interface NavLeftPage {
  id: string;
  label: string;
  icon: string;
  tone: ToneColor;
  subPages?: NavSubPage[];
  topTabs?: NavTopTab[];   // only when no subPages
  pageTargetId?: string;   // only when no subPages and no topTabs
  pageTargetType?: 'report' | 'page' | 'form';
}

export interface NavPrimaryPage {
  id: string;
  label: string;
  icon: string;
  tone: ToneColor;
  leftPages?: NavLeftPage[];
  topTabs?: NavTopTab[];   // only when no leftPages and dependency = primary
  pageTargetId?: string;   // only when no leftPages and no topTabs
  pageTargetType?: 'report' | 'page' | 'form';
}

export interface NavigationConfig {
  primaryPages: NavPrimaryPage[];
}

// ── Forms ────────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'email' | 'phone' | 'number' | 'date' | 'datetime' | 'time'
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'toggle'
  | 'textarea' | 'richtext' | 'file' | 'image' | 'heading' | 'divider';

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  validation?: FieldValidation;
  options?: FieldOption[];
  optionsFromEntity?: string;   // entity key in mockData → derives options
  width?: 'full' | 'half' | 'third';
  conditionalOn?: { fieldId: string; operator: '==' | '!='; value: unknown };
}

export interface FormSection {
  id: string;
  title?: string;
  columns?: 1 | 2 | 3;
  fields: FormField[];
}

export interface FormConfig {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  datasourceEntity?: string;
  sections: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
}

// ── Dataframes ───────────────────────────────────────────────────────────────

export type ColumnType =
  | 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'avatar'
  | 'link' | 'currency' | 'percentage';

export interface DataframeColumn {
  id: string;
  field: string;
  header: string;
  type: ColumnType;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  badgeOptions?: FieldOption[];
  format?: string;
}

export interface DataframeConfig {
  id: string;
  name: string;
  description?: string;
  entity: string;                          // key in mockData
  columns: DataframeColumn[];
  defaultView?: 'list' | 'card';
  searchable?: boolean;
  searchFields?: string[];
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  pageSize?: number;
  addFormId?: string;
  editFormId?: string;
}

// ── Pages (canvas widgets) ───────────────────────────────────────────────────

export type WidgetType = 'kpi' | 'chart' | 'table' | 'form' | 'dataframe' | 'richtext' | 'image' | 'divider';

export interface WidgetLayout { x: number; y: number; w: number; h: number; }

export interface KpiConfig {
  title: string;
  entity: string;
  metric: 'count' | 'sum' | 'avg';
  field?: string;
  filter?: Record<string, unknown>;
  icon?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
  trend?: { field: string; label: string };
}

export interface ChartConfig {
  title: string;
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'area';
  entity: string;
  groupByField: string;
  valueField?: string;
  aggregation?: 'count' | 'sum' | 'avg';
  colorScheme?: string[];
  limit?: number;
}

export interface PageWidget {
  id: string;
  type: WidgetType;
  layout: WidgetLayout;
  config: KpiConfig | ChartConfig | Record<string, unknown>;
}

export interface PageConfig {
  id: string;
  name: string;
  description?: string;
  widgets: PageWidget[];
}

// ── Workflows ────────────────────────────────────────────────────────────────

export type StepType =
  | 'trigger' | 'condition' | 'api' | 'email' | 'sms'
  | 'notification' | 'approval' | 'delay' | 'transform';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  nextStepId?: string;
  onApprove?: string;
  onReject?: string;
  branches?: Array<{ condition: string; nextStepId: string }>;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  category?: string;
  trigger: WorkflowStep;
  steps: WorkflowStep[];
}

// ── Datasources ──────────────────────────────────────────────────────────────

export interface DatasourceConfig {
  id: string;
  name: string;
  type: 'mock' | 'rest' | 'graphql';
  entity?: string;     // key in mockData for mock type
  endpoint?: string;   // URL for rest/graphql
  headers?: Record<string, string>;
}

// ── Deployment configurations ────────────────────────────────────────────────

export interface DeploymentEnvironmentConfig {
  id: string;
  name: string;
  url: string;
  status: string;
  users: string;
}

export interface DesktopDeploymentConfig {
  primaryClickBehaviour: 'direct' | 'selectors';
  topDependencySource: 'left' | 'primary';
  headerOptions: {
    left: Array<{ id: string; label: string; checked: boolean }>;
    right: Array<{ id: string; label: string; checked: boolean }>;
  };
  footerOptions: Array<{ id: string; label: string; checked: boolean }>;
  environments: DeploymentEnvironmentConfig[];
}

export interface MobileDeploymentConfig {
  primaryClickBehaviour: 'direct' | 'selectors';
  topDependencySource: 'left' | 'primary';
  headerOptions: {
    left: Array<{ id: string; label: string; checked: boolean }>;
    right: Array<{ id: string; label: string; checked: boolean }>;
  };
  bottomNavItems: Array<{ id: string; label: string; icon: string }>;
  environments: DeploymentEnvironmentConfig[];
}

// ── Mock data schema ─────────────────────────────────────────────────────────

export interface MockDataSchema {
  entities: string[];
  recordCounts: Record<string, number>;
  seed: number;
}

// ── Root app config ──────────────────────────────────────────────────────────

export interface AppConfig {
  application: {
    id: string;
    version: string;
    name: string;
    environment: 'development' | 'staging' | 'production';
  };
  branding: BrandingConfig;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  datasources: DatasourceConfig[];
  forms: FormConfig[];
  dataframes: DataframeConfig[];
  pages: PageConfig[];
  workflows: WorkflowConfig[];
  pageTargets: Record<string, { assetId: string; assetType: 'report' | 'page' | 'form' }>;
  desktop: DesktopDeploymentConfig;
  mobile: MobileDeploymentConfig;
  mockData: MockDataSchema;
}
