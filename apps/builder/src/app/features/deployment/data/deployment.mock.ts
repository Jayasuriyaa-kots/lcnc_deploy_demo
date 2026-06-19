export const DEPLOYMENT_ROLE_TABS = [
  { label: 'Employee', count: 9876, active: true },
  { label: 'Manager', count: 412 },
  { label: 'HR Admin', count: 38 },
  { label: 'Super Admin', count: 6 },
];

export const DEPLOYMENT_ROLE_USERS = [
  { name: 'Priya Sharma',       email: 'priya.sharma@quantaops.com',     initials: 'PS' },
  { name: 'Rahul Mehta',        email: 'rahul.mehta@quantaops.com',      initials: 'RM' },
  { name: 'Ananya Krishnan',    email: 'ananya.k@quantaops.com',         initials: 'AK' },
  { name: 'Vikram Nair',        email: 'vikram.nair@quantaops.com',      initials: 'VN' },
  { name: 'Neha Gupta',         email: 'neha.gupta@quantaops.com',       initials: 'NG' },
  { name: 'Arjun Patel',        email: 'arjun.patel@quantaops.com',      initials: 'AP' },
  { name: 'Divya Iyer',         email: 'divya.iyer@quantaops.com',       initials: 'DI' },
];

export const DEPLOYMENT_PERMISSION_GROUPS = [
  {
    label: 'Forms',
    items: [
      { name: 'Add Employee Form',       icon: 'file-text', tone: 'blue' },
      { name: 'Employee Leave Form',     icon: 'file-text', tone: 'blue' },
      { name: 'Attendance Form',         icon: 'file-text', tone: 'blue' },
      { name: 'Performance Review',      icon: 'file-text', tone: 'blue' },
      { name: 'Asset Request',           icon: 'file-text', tone: 'blue' },
      { name: 'Travel Reimbursement',    icon: 'file-text', tone: 'blue' },
      { name: 'Recruitment Application', icon: 'file-text', tone: 'blue' },
      { name: 'Employee Exit Form',      icon: 'file-text', tone: 'blue' },
      { name: 'Training Registration',   icon: 'file-text', tone: 'blue' },
      { name: 'IT Support Ticket',       icon: 'file-text', tone: 'blue' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'Employee Directory',          icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Attendance Summary',          icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Leave Summary',               icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Performance Reviews Q2 2026', icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Asset Inventory',             icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Travel Expense Claims',       icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Recruitment Pipeline',        icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Headcount by Department',     icon: 'bar-chart-3', tone: 'purple' },
      { name: 'Training Calendar',           icon: 'bar-chart-3', tone: 'purple' },
      { name: 'IT Support Tickets',          icon: 'bar-chart-3', tone: 'purple' },
    ],
  },
  {
    label: 'Pages',
    items: [
      { name: 'HR Dashboard',        icon: 'layout-dashboard', tone: 'green' },
      { name: 'Employee Portal',     icon: 'layout-dashboard', tone: 'green' },
      { name: 'Manager View',        icon: 'layout-dashboard', tone: 'green' },
      { name: 'Recruitment Hub',     icon: 'layout-dashboard', tone: 'green' },
      { name: 'Analytics Board',     icon: 'layout-dashboard', tone: 'green' },
      { name: 'Learning Centre',     icon: 'layout-dashboard', tone: 'green' },
      { name: 'IT Support Portal',   icon: 'layout-dashboard', tone: 'green' },
      { name: 'Travel & Expenses',   icon: 'layout-dashboard', tone: 'green' },
    ],
  },
];

export const DEPLOYMENT_FIELD_PERMISSIONS = [
  { name: 'Annual Salary (salary_band)',      type: 'Currency field', rule: 'Hidden from Employee role' },
  { name: 'National ID / PAN',               type: 'Text field',     rule: 'Masked for all non-HR roles' },
  { name: 'Performance Score',               type: 'Number field',   rule: 'View only — no edit' },
  { name: 'Bank Account Number',             type: 'Text field',     rule: 'Hidden from Viewer' },
  { name: 'Manager Comments (review)',       type: 'Textarea field', rule: 'Hidden from Employee role' },
  { name: 'IT Ticket Escalation Log',        type: 'Textarea field', rule: 'Restricted to IT Support role' },
];

export const DEPLOYMENT_COLOUR_TOKENS = [
  { label: 'Primary', value: 'var(--qo-color-neutral-900)' },
  { label: 'Accent', value: 'var(--qo-color-neutral-700)' },
  { label: 'Surface', value: 'var(--qo-color-neutral-0)' },
  { label: 'Background', value: 'var(--qo-color-neutral-50)' },
];

export const DEPLOYMENT_BEHAVIOUR_SETTINGS = [
  { title: 'Enable dark mode toggle', description: 'Allow users to switch themes', enabled: false },
  { title: 'Show notification bell', description: 'Display real-time notifications in header', enabled: true },
  { title: 'Auto-save forms', description: 'Automatically save form progress every 30 seconds', enabled: false },
  { title: 'Enable offline mode (PWA)', description: 'Allow the application to function without internet', enabled: false },
  { title: 'Show breadcrumbs', description: 'Display navigation breadcrumb trail', enabled: true },
];

export const DEPLOYMENT_MOBILE_PREVIEW_PAGES = [
  { title: 'HR Dashboard',      subtitle: 'Workforce at a glance' },
  { title: 'Employee Portal',   subtitle: 'Forms and self-service' },
  { title: 'Manager View',      subtitle: 'Team approvals and reviews' },
  { title: 'Recruitment Hub',   subtitle: 'Candidate pipeline' },
  { title: 'Analytics Board',   subtitle: 'HR metrics and trends' },
  { title: 'Learning Centre',   subtitle: 'Training registrations' },
  { title: 'IT Support Portal', subtitle: 'Raise and track tickets' },
  { title: 'Travel & Expenses', subtitle: 'Submit and track claims' },
];

export const DEPLOYMENT_MOBILE_NAVIGATION_OPTIONS = [
  { title: 'Bottom Tab Bar', description: '5 icon slots. Recommended.', active: true },
  { title: 'Side Drawer', description: 'Hamburger and slide-in menu.', active: false },
  { title: 'Hamburger Overlay', description: 'Full-screen overlay nav.', active: false },
];

export const DEPLOYMENT_MOBILE_SETTINGS = [
  { title: 'Touch Targets', description: 'Minimum target size is enforced for interactive elements.', enabled: true },
  { title: 'Native Mobile Pickers', description: 'Use native date, time, and dropdown pickers on mobile.', enabled: true },
  { title: 'Offline Mode (PWA)', description: 'Cache data locally. Syncs automatically when reconnected.', enabled: false },
  { title: 'Push Notifications', description: 'Trigger push alerts from workflow events.', enabled: false },
];

export const DEPLOYMENT_MOBILE_ASSET_UPLOADS = [
  { title: 'App Icon', icon: 'image', primaryText: 'Upload PNG asset', helperText: 'For home screen and splash' },
  { title: 'Splash Screen', icon: 'image', primaryText: 'Upload launch asset', helperText: 'Shown on app launch' },
];

export const DEPLOYMENT_MOBILE_BOTTOM_NAV_ITEMS = [
  { icon: 'layout-dashboard', label: 'Dashboard',   active: true },
  { icon: 'users',            label: 'People',      active: false },
  { icon: 'bar-chart-3',      label: 'Reports',     active: false },
  { icon: 'briefcase',        label: 'Hiring',      active: false },
  { icon: 'more-horizontal',  label: 'More',        active: false },
];

export const DEPLOYMENT_MOBILE_PREVIEW_CALLOUTS = [
  { title: 'Header', description: 'Top bar with menu, logo, search, notifications, and user profile.', color: 'var(--qo-color-success-500)' },
  { title: 'Top Page Selector', description: 'Switch between main pages horizontally.', color: 'var(--qo-color-info-500)' },
  { title: 'Action Bar', description: 'Contextual actions for the current page.', color: 'var(--qo-color-primary-500)' },
  { title: 'Submenu Pages', description: 'Switch between sub sections of the selected top page.', color: 'var(--qo-color-warning-500)' },
  { title: 'Left Page Selector', description: 'Switch between sections of the current submenu.', color: 'var(--qo-color-danger-500)' },
  { title: 'Primary Page Selector', description: 'Primary navigation for major application areas.', color: 'var(--qo-color-info-600)' },
];
