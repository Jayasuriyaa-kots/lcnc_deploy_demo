import { BuilderModuleConfig, BuilderModuleLink } from '@builder/core/models/builder-shell.model';

export const BUILDER_MODULE_LINKS: BuilderModuleLink[] = [
  { id: 'deployment', label: 'Deployment', route: '/deployment' },
  { id: 'datasources', label: 'Data Sources', route: '/datasources' },
  { id: 'form-builder', label: 'Form Builder', route: '/form-builder' },
  { id: 'report-builder', label: 'Dataframe Builder', route: '/report-builder' },
  { id: 'page-builder', label: 'Page Builder', route: '/page-builder' },
  { id: 'workflow-builder', label: 'Workflow Builder', route: '/workflow-builder' }
];

export const BUILDER_MODULE_CONFIG: Record<string, BuilderModuleConfig> = {
  deployment: {
    id: 'deployment',
    label: 'Deployment',
    route: '/deployment',
    sidebarTitle: 'Deployment',
    sidebarMode: 'tabs',
    actionLabel: 'New',
    searchPlaceholder: 'Search deployment...',
    items: [],
    tabs: [
      { id: 'desktop', label: 'Desktop Web', icon: 'monitor', route: '/deployment/desktop' },
      { id: 'mobile', label: 'Mobile Web', icon: 'smartphone', route: '/deployment/mobile' },
      { id: 'users', label: 'User Management', icon: 'manage_accounts', route: '/deployment/users' },
      { id: 'prefs', label: 'Preferences', icon: 'tune', route: '/deployment/preferences' }
    ]
  },
  datasources: {
    id: 'datasources',
    label: 'Data Sources',
    route: '/datasources',
    sidebarTitle: 'Data Sources',
    sidebarMode: 'tabs',
    actionLabel: 'New',
    searchPlaceholder: 'Search data source...',
    items: [],
    tabs: [
      { id: 'sources', label: 'Data Sources', icon: 'storage', route: '/datasources/sources' },
      { id: 'apis', label: 'External APIs', icon: 'cable', route: '/datasources/apis' },
      { id: 'logs', label: 'Data Logs', icon: 'receipt_long', route: '/datasources/logs' },
      { id: 'compliance', label: 'Compliance', icon: 'verified_user', route: '/datasources/compliance' }
    ]
  },
  'form-builder': {
    id: 'form-builder',
    label: 'Form Builder',
    route: '/form-builder',
    sidebarTitle: 'Form Builder',
    sidebarMode: 'list',
    actionLabel: 'New',
    searchPlaceholder: 'Search...',
    items: []
  },
  'report-builder': {
    id: 'report-builder',
    label: 'Dataframe Builder',
    route: '/report-builder',
    sidebarTitle: 'Dataframe Builder',
    sidebarMode: 'list',
    actionLabel: 'New',
    searchPlaceholder: 'Search...',
    items: []
  },
  'page-builder': {
    id: 'page-builder',
    label: 'Page Builder',
    route: '/page-builder',
    sidebarTitle: 'Page Builder',
    sidebarMode: 'list',
    actionLabel: 'New',
    searchPlaceholder: 'Search...',
    items: []
  },
  'page-builder-edit': {
    id: 'page-builder-edit',
    label: 'Page Builder',
    route: '/page-builder/edit',
    sidebarTitle: 'Widgets',
    sidebarMode: 'palette',
    actionLabel: 'New',
    searchPlaceholder: 'Search...',
    items: [],
    paletteItems: [
      { id: 'chart', label: 'Chart', icon: 'insert_chart' },
      // { id: 'search', label: 'Search', icon: 'search' },
      // { id: 'form', label: 'Form', icon: 'list_alt' },
      // { id: 'report', label: 'Report', icon: 'grid_view' },
      { id: 'table', label: 'Table', icon: 'table_rows' },
      { id: 'snippets', label: 'Snippets', icon: 'content_copy' },
      { id: 'button', label: 'Button', icon: 'crop_square' },
      { id: 'text-block', label: 'Text Block', icon: 'text_fields' },
      { id: 'label', label: 'Label', icon: 'label' },
      // { id: 'board', label: 'Board', icon: 'monitoring' },
      { id: 'select', label: 'Select', icon: 'list' },
      { id: 'media', label: 'Media', icon: 'perm_media' },
      { id: 'panel', label: 'Panel', icon: 'dashboard_customize' },
      // { id: 'gauge', label: 'Gauge', icon: 'speed' },
      // { id: 'widgets', label: 'Widgets', icon: 'widgets' },
      // { id: 'viewer', label: 'Viewer', icon: 'draw' }
    ]
  },
  'workflow-builder': {
    id: 'workflow-builder',
    label: 'Workflow Builder',
    route: '/workflow-builder',
    sidebarTitle: 'Workflow Builder',
    sidebarMode: 'tabs',
    actionLabel: 'New Flow',
    searchPlaceholder: 'Search workflow...',
    items: [],
    tabs: [
      { id: 'form-actions', label: 'Form Actions', icon: 'dynamic_form', route: '/workflow-builder/form-actions' },
      //{ id: 'events', label: 'Events', icon: 'bolt', route: '/workflow-builder/events' },
      { id: 'scheduler', label: 'Scheduler', icon: 'schedule', route: '/workflow-builder/scheduler' },
      //{ id: 'action-buttons', label: 'Action Buttons', icon: 'smart_button', route: '/workflow-builder/action-buttons' },
      //{ id: 'functions', label: 'Functions', icon: 'code', route: '/workflow-builder/functions' }
    ]
  }
};
