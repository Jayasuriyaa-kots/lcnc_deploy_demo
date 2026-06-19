import {
  CanvasWidget,
  ChartWidgetConfig,
  MediaWidgetConfig,
  PanelWidgetConfig,
  TableWidgetConfig,
  TextBlockWidgetConfig,
} from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ChartType } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';

// Design tokens (mirror CSS vars used by the builder shell)
const SFC = 'var(--qo-color-neutral-0)';
const TXT = 'var(--qo-color-neutral-900)';
const BDR = 'var(--qo-border-color)';
const RXL = 'var(--qo-radius-xl)';
const RSM = 'var(--qo-radius-sm)';

// --- Canvas layout constants ---
const CANVAS_W = 1224;  // total usable canvas width (1280 – 2*28 px inset)
const KW4 = 294;        // 4-column KPI panel width  (4*294 + 3*16 = 1224)
const KW3 = 392;        // 3-column KPI panel width  (3*392 + 2*24 = 1224)
const CW2 = 600;        // 2-column chart width      (2*600 + 24   = 1224)
const KH  = 120;        // KPI panel height
const CH  = 300;        // chart height
const TH  = 380;        // table height
const PH  = 340;        // PDF viewer height
const HH  = 48;         // header text-block height
const G   = 20;         // vertical gap between rows

// x-axis start positions
const KX4 = [0, 310, 620, 930];   // 4-col KPI  (gap=16)
const KX3 = [0, 416, 832];        // 3-col KPI  (gap=24)
const CX2 = [0, 624];             // 2-col chart (gap=24)

// Row y positions (when page starts with a header at y=0)
const Y_H   = 0;
const Y_KPI = HH + G;
const Y_ROW2 = Y_KPI + KH + G;
const Y_ROW3 = Y_ROW2 + CH + G;
const Y_ROW3T = Y_ROW2 + TH + G;

// ─── Widget factories ────────────────────────────────────────────────────────

function mkPanel(
  id: string,
  x: number,
  y: number,
  w: number,
  title: string,
  value: string,
  subtitle: string,
  caption: string,
  icon: string,
  iconBg: string,
): CanvasWidget {
  const panelConfig: PanelWidgetConfig = {
    visible: true,
    title,
    value,
    subtitle,
    caption,
    trend: '',
    suffix: '',
    titleColor: TXT,
    iconSymbol: icon,
    iconBackgroundColor: iconBg,
    iconColor: '#ffffff',
    valueColor: '#111827',
    backgroundColor: SFC,
    borderColor: BDR,
    borderRadius: RXL,
    alignment: 'right',
    iconPlacement: 'before',
    layoutVariant: 'icon-left-value-top',
    sourceType: 'text',
    datasourceId: '',
    queryId: '',
    field: '',
    aggregationType: 'count',
    filters: [],
    condition: null,
    staticText: value,
    bindingExpression: '',
    presetId: '',
  };
  return { id, type: 'panel-showcase', x, y, width: w, height: KH, label: title, widgetProps: { panelConfig } };
}

function mkChart(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  chartType: ChartType,
  dsId: string,
  xAxis: string,
  yAxis: string,
  color: string,
): CanvasWidget {
  const chartConfig: ChartWidgetConfig = {
    datasourceId: dsId,
    datasourceLabel: dsId,
    queryId: '',
    queryBinding: '',
    xAxisCategory: xAxis,
    xAxisLabel: xAxis,
    yAxisField: yAxis,
    yAxisStackBy: '',
    aggregateValue: { tab: null, value: null },
    yAxisLabel: '',
    interval: '',
    filterDataBasedOn: [],
    showDataLabel: true,
    showUnderlyingData: false,
    valueType: 'aggregate',
    recordScope: 'all',
    selectedRecordCriteriaRows: [],
    chartColor: color,
    chartColorSecondary: '',
  };
  return { id, type: 'chart-showcase', x, y, width, height, label, chartType, chartTypeLabel: chartType, widgetProps: { chartConfig } };
}

function mkTable(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  dsKey: string,
  cols: { key: string; label: string }[],
  rows: Record<string, string | number>[],
): CanvasWidget {
  const tableConfig: TableWidgetConfig = {
    visible: true,
    rowsPerPage: 10,
    tableSize: 'default',
    backgroundColor: SFC,
    borderColor: BDR,
    borderRadius: RSM,
    showSearch: true,
    showDownload: true,
    showSorting: true,
    showColumnFilters: true,
    enableAdd: false,
    enableEdit: false,
    enableDelete: false,
    enableDuplicate: false,
    dataSourceKey: dsKey,
    queryId: '',
    queryBinding: '',
    dataColumns: cols.map((c) => c.key),
    columnConfigs: cols.map((c, i) => ({
      key: c.key,
      label: c.label,
      visible: true,
      order: i,
      width: 150,
      align: 'left' as const,
      type: 'text' as const,
    })),
    dataRows: rows,
  };
  return { id, type: 'table-showcase', x, y, width, height, label, widgetProps: { tableConfig } };
}

function mkPdf(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  title: string,
  caption: string,
): CanvasWidget {
  const mediaConfig: MediaWidgetConfig = {
    visible: true,
    mediaType: 'pdf',
    sourceMode: 'static-url',
    title,
    caption,
    backgroundColor: 'var(--qo-color-neutral-50)',
    sourceUrl: '',
    datasourceId: '',
    queryId: '',
    queryBinding: '',
    recordId: '',
    imageField: '',
    titleField: '',
    captionField: '',
    showTitle: true,
    showCaption: true,
    uploadedImageDataUrl: '',
    uploadedVideoDataUrl: '',
    uploadedPdfDataUrl: '',
    autoPlay: false,
    pdfDefaultPage: 1,
    pdfShowToolbar: true,
    pdfAllowDownload: true,
    pdfAllowPrint: true,
    pdfZoomLevel: 100,
    pdfFitToWidth: true,
    pdfDisabled: false,
    pdfLoadingState: false,
  };
  return { id, type: 'media-showcase', x, y, width, height, label, widgetProps: { mediaConfig } };
}

function mkHeader(id: string, y: number, text: string): CanvasWidget {
  const textBlockConfig: TextBlockWidgetConfig = {
    label: text,
    widgetName: '',
    labelColor: TXT,
    labelFontSize: 'var(--qo-text-sm)',
    fontFamily: 'var(--qo-font-family-sans)',
    fontSize: 'var(--qo-text-xl)',
    fontWeight: 'var(--qo-font-normal)',
    lineHeight: 'var(--qo-leading-normal)',
    letterSpacing: 'normal',
    bold: true,
    italic: false,
    underline: false,
    lineThrough: false,
    textAlign: 'left',
    inputType: 'labeltext',
    allowTypeSelection: false,
    visible: true,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0',
    borderRadius: '0',
    placeholder: text,
    text,
    defaultValue: text,
    contentSource: 'static',
    datasourceId: '',
    queryId: '',
    recordId: '',
    field: '',
    overflowText: 'none',
    disableLinks: false,
    allowedFileTypes: 'all',
    dataFormat: 'file',
    maxFiles: 1,
    animateLoading: true,
    dateFormat: '',
    minDate: '',
    maxDate: '',
    required: false,
    readOnly: false,
    disabled: false,
    minLength: null,
    maxLength: null,
    customRegex: '',
  };
  return {
    id,
    type: 'text-block-showcase',
    x: 0,
    y,
    width: CANVAS_W,
    height: HH,
    label: text,
    textBlockVariant: 'labeltext',
    widgetProps: { textBlockConfig },
  };
}

// ─── Shared column definitions ────────────────────────────────────────────────

const EMP_COLS = [
  { key: 'employee_code', label: 'Code' },
  { key: 'employee_name', label: 'Name' },
  { key: 'department',    label: 'Department' },
  { key: 'location',      label: 'Location' },
  { key: 'start_date',    label: 'Start Date' },
  { key: 'status',        label: 'Status' },
];

const NEW_JOINER_ROWS: Record<string, string>[] = [
  { employee_code: 'QT-9988', employee_name: 'Ishaan Verma',   department: 'Engineering',        location: 'Bangalore',  start_date: '2026-06-10', status: 'New Joiner' },
  { employee_code: 'QT-9956', employee_name: 'Simran Kaur',    department: 'Human Resources',    location: 'Delhi',      start_date: '2026-06-03', status: 'New Joiner' },
  { employee_code: 'QT-9923', employee_name: 'Rohan Desai',    department: 'Sales',              location: 'Mumbai',     start_date: '2026-05-28', status: 'New Joiner' },
  { employee_code: 'QT-9901', employee_name: 'Preeti Joshi',   department: 'Finance',            location: 'Hyderabad',  start_date: '2026-05-20', status: 'New Joiner' },
  { employee_code: 'QT-9876', employee_name: 'Aniket Mishra',  department: 'Operations',         location: 'Pune',       start_date: '2026-05-15', status: 'New Joiner' },
  { employee_code: 'QT-9845', employee_name: 'Riya Patel',     department: 'Customer Support',   location: 'Ahmedabad',  start_date: '2026-05-12', status: 'New Joiner' },
  { employee_code: 'QT-9812', employee_name: 'Yash Mehta',     department: 'Design',             location: 'Bangalore',  start_date: '2026-05-05', status: 'New Joiner' },
];

// ─── Page layouts ─────────────────────────────────────────────────────────────

export const PAGE_CANVAS_DEFAULT_WIDGETS: Record<string, CanvasWidget[]> = {

  // ── p1: HR Dashboard ────────────────────────────────────────────────────────
  p1: [
    mkHeader('p1-h0', Y_H, 'HR Dashboard — Q2 2026'),

    mkPanel('p1-k1', KX4[0], Y_KPI, KW4, 'Total Employees', '9,876',  'Across all 9 cities',       '+2.4% this quarter', 'people',        '#2563eb'),
    mkPanel('p1-k2', KX4[1], Y_KPI, KW4, 'Active',          '7,506',  'Currently at work',         '76.0% of headcount', 'check_circle',  '#16a34a'),
    mkPanel('p1-k3', KX4[2], Y_KPI, KW4, 'On Leave',        '1,381',  'Approved absences',         '14.0% of headcount', 'event_busy',    '#ca8a04'),
    mkPanel('p1-k4', KX4[3], Y_KPI, KW4, 'New Joiners',     '989',    'Joined in last 90 days',    '10.0% of headcount', 'person_add',    '#7c3aed'),

    mkChart('p1-c1', CX2[0], Y_ROW2, CW2, CH, 'Headcount by Department',  'column', 'employees_form', 'department', 'employee_code', '#2563eb'),
    mkChart('p1-c2', CX2[1], Y_ROW2, CW2, CH, 'Monthly Hiring Trend',     'line',   'employees_form', 'start_date', 'employee_code', '#7c3aed'),

    mkTable('p1-t1', 0, Y_ROW3, CANVAS_W, TH, 'Recent Joiners', 'employees_form', EMP_COLS, NEW_JOINER_ROWS),
  ],

  // ── p2: Employee Portal ──────────────────────────────────────────────────────
  p2: [
    mkHeader('p2-h0', Y_H, 'My Workspace'),

    mkPanel('p2-k1', KX3[0], Y_KPI, KW3, 'Leave Balance',     '12 days', 'Annual leave remaining',    'FY 2026–27',          'event_available', '#16a34a'),
    mkPanel('p2-k2', KX3[1], Y_KPI, KW3, 'Sick Days Used',    '3 days',  'This financial year',       'Limit: 12 days / yr', 'sick',            '#ef4444'),
    mkPanel('p2-k3', KX3[2], Y_KPI, KW3, 'Comp-Off Credit',   '2 days',  'Weekend-worked credit',     'Valid until Dec 2026', 'schedule',       '#2563eb'),

    mkTable('p2-t1', 0, Y_ROW2, CANVAS_W, TH, 'Employee Directory', 'employees_form', EMP_COLS, [
      { employee_code: 'QT-0001', employee_name: 'Priya Sharma',    department: 'Human Resources',    location: 'Bangalore', start_date: '2021-03-15', status: 'Active' },
      { employee_code: 'QT-0002', employee_name: 'Rahul Mehta',     department: 'Engineering',        location: 'Mumbai',    start_date: '2019-07-01', status: 'Active' },
      { employee_code: 'QT-0003', employee_name: 'Ananya Krishnan', department: 'Product Management', location: 'Bangalore', start_date: '2022-01-10', status: 'Active' },
      { employee_code: 'QT-0004', employee_name: 'Vikram Nair',     department: 'Sales',              location: 'Delhi',     start_date: '2018-11-20', status: 'Active' },
      { employee_code: 'QT-0005', employee_name: 'Neha Gupta',      department: 'Finance',            location: 'Hyderabad', start_date: '2020-05-05', status: 'On Leave' },
      { employee_code: 'QT-0006', employee_name: 'Arjun Patel',     department: 'Engineering',        location: 'Pune',      start_date: '2023-02-14', status: 'Active' },
      { employee_code: 'QT-0007', employee_name: 'Divya Iyer',      department: 'Marketing',          location: 'Chennai',   start_date: '2021-09-01', status: 'Active' },
    ]),

    mkPdf('p2-pdf', 0, Y_ROW3T, CANVAS_W, PH, 'Leave Policy', 'Leave & Attendance Policy 2026', 'QuantaOps HR Policy Document · Effective April 2026'),
  ],

  // ── p3: Manager View ─────────────────────────────────────────────────────────
  p3: [
    mkHeader('p3-h0', Y_H, 'Manager Dashboard'),

    mkPanel('p3-k1', KX4[0], Y_KPI, KW4, 'Team Size',          '24',    'Direct & indirect reports', 'Engineering Team',    'group',           '#2563eb'),
    mkPanel('p3-k2', KX4[1], Y_KPI, KW4, 'Pending Approvals',  '7',     'Leave requests awaiting',   'Oldest: 3 days ago',  'pending_actions', '#ca8a04'),
    mkPanel('p3-k3', KX4[2], Y_KPI, KW4, 'Reviews Due',        '3',     'Q2 performance reviews',    'Due by Jun 30',       'rate_review',     '#ef4444'),
    mkPanel('p3-k4', KX4[3], Y_KPI, KW4, 'Attendance',         '94.2%', 'This month average',        'Target ≥ 92%',        'event_available', '#16a34a'),

    mkTable('p3-t1', 0, Y_ROW2, CANVAS_W, TH, 'My Team', 'employees_form', EMP_COLS, [
      { employee_code: 'QT-0101', employee_name: 'Aarav Mehta',   department: 'Engineering', location: 'Bangalore', start_date: '2021-04-01', status: 'Active' },
      { employee_code: 'QT-0145', employee_name: 'Pooja Pillai',  department: 'Engineering', location: 'Bangalore', start_date: '2022-09-15', status: 'Active' },
      { employee_code: 'QT-0178', employee_name: 'Dev Sharma',    department: 'Engineering', location: 'Hyderabad', start_date: '2020-07-22', status: 'Active' },
      { employee_code: 'QT-0203', employee_name: 'Kavita Rao',    department: 'Engineering', location: 'Bangalore', start_date: '2023-01-10', status: 'New Joiner' },
      { employee_code: 'QT-0256', employee_name: 'Sanjay Kumar',  department: 'Engineering', location: 'Pune',      start_date: '2019-11-05', status: 'On Leave' },
    ]),

    mkChart('p3-c1', 0, Y_ROW3T, CANVAS_W, CH, 'Team Leave Requests by Type', 'column', 'leave_form', 'leave_type', 'days', '#2563eb'),
  ],

  // ── p4: Recruitment Hub ──────────────────────────────────────────────────────
  p4: [
    mkHeader('p4-h0', Y_H, 'Recruitment Pipeline'),

    mkPanel('p4-k1', KX3[0], Y_KPI, KW3, 'Open Positions',        '42',  'Active job postings',       'Across 6 departments', 'work',        '#2563eb'),
    mkPanel('p4-k2', KX3[1], Y_KPI, KW3, 'Applications',          '318', 'Received this quarter',     '+23% vs Q1',           'description', '#7c3aed'),
    mkPanel('p4-k3', KX3[2], Y_KPI, KW3, 'Interviews Scheduled',  '28',  'This week',                 '8 offers extended',    'groups',      '#16a34a'),

    mkChart('p4-c1', CX2[0], Y_ROW2, CW2, CH, 'Applications by Role',     'column', 'recruitment_form', 'applied_role',     'experience_years', '#7c3aed'),
    mkPdf  ('p4-pdf', CX2[1], Y_ROW2, CW2, CH, 'Offer Letter Template',   'Offer Letter Template',     'Standard QuantaOps Offer Letter — Legal Approved'),

    mkTable('p4-t1', 0, Y_ROW3, CANVAS_W, TH, 'Candidate Pipeline', 'recruitment_form',
      [
        { key: 'candidate_name',    label: 'Candidate' },
        { key: 'applied_role',      label: 'Role' },
        { key: 'experience_years',  label: 'Exp (yrs)' },
        { key: 'current_company',   label: 'Current Employer' },
        { key: 'notice_period',     label: 'Notice Period' },
      ],
      [
        { candidate_name: 'Akash Tiwari',    applied_role: 'Senior SDE',           experience_years: 5, current_company: 'Infosys',  notice_period: '60 days' },
        { candidate_name: 'Meera Rajan',     applied_role: 'HR Business Partner',  experience_years: 7, current_company: 'Wipro',    notice_period: '30 days' },
        { candidate_name: 'Siddharth Bose',  applied_role: 'Sales Manager',        experience_years: 9, current_company: 'HCL',      notice_period: '90 days' },
        { candidate_name: 'Nisha Pillai',    applied_role: 'Data Analyst',         experience_years: 3, current_company: 'TCS',      notice_period: '45 days' },
        { candidate_name: 'Kiran Reddy',     applied_role: 'Product Manager',      experience_years: 6, current_company: 'Mphasis',  notice_period: '30 days' },
      ]
    ),
  ],

  // ── p5: Analytics Board ──────────────────────────────────────────────────────
  p5: [
    mkHeader('p5-h0', Y_H, 'Workforce Analytics'),

    mkPanel('p5-k1', KX4[0], Y_KPI, KW4, 'Total Headcount', '9,876',    'Active workforce',           'FY 2026–27',          'analytics',     '#2563eb'),
    mkPanel('p5-k2', KX4[1], Y_KPI, KW4, 'Attrition YTD',  '4.2%',     'Voluntary exits',            'Below 5% target ✓',   'trending_down', '#ef4444'),
    mkPanel('p5-k3', KX4[2], Y_KPI, KW4, 'Avg Tenure',     '3.8 yrs',  'Across all employees',       'Industry avg: 3.2 yr', 'access_time',  '#16a34a'),
    mkPanel('p5-k4', KX4[3], Y_KPI, KW4, 'New Joiners YTD','989',       'Jan – Jun 2026',             '10.0% of workforce',  'person_add',    '#7c3aed'),

    mkChart('p5-c1', 0, Y_ROW2, CANVAS_W, CH, 'Monthly Headcount Growth Trend', 'line', 'employees_form', 'start_date', 'employee_code', '#2563eb'),

    mkChart('p5-c2', CX2[0], Y_ROW3, CW2, CH, 'Headcount by Department', 'column', 'employees_form', 'department', 'employee_code', '#2563eb'),
    mkChart('p5-c3', CX2[1], Y_ROW3, CW2, CH, 'Headcount by City',       'bar',    'employees_form', 'location',   'employee_code', '#16a34a'),
  ],

  // ── p6: Learning Centre ──────────────────────────────────────────────────────
  p6: [
    mkHeader('p6-h0', Y_H, 'Learning & Development'),

    mkPanel('p6-k1', KX3[0], Y_KPI, KW3, 'Programs Active',  '15',   'Current training programs',  'Q2 2026 schedule',  'school',    '#2563eb'),
    mkPanel('p6-k2', KX3[1], Y_KPI, KW3, 'Enrolled',         '842',  'Active registrations',       '+12% vs Q1',        'people',    '#16a34a'),
    mkPanel('p6-k3', KX3[2], Y_KPI, KW3, 'Completion Rate',  '73%',  'Programs completed',         'Target: 80%',       'verified',  '#ca8a04'),

    mkTable('p6-t1', 0, Y_ROW2, CANVAS_W, TH, 'Training Calendar', 'training_form',
      [
        { key: 'training_program',  label: 'Program' },
        { key: 'training_mode',     label: 'Mode' },
        { key: 'preferred_date',    label: 'Date' },
        { key: 'employee_id',       label: 'Employee Code' },
        { key: 'manager_approved',  label: 'Approved' },
      ],
      [
        { training_program: 'Advanced Excel for Finance',     training_mode: 'Online',    preferred_date: '2026-06-20', employee_id: 'QT-0234', manager_approved: 'Yes' },
        { training_program: 'Leadership Essentials',          training_mode: 'In-person', preferred_date: '2026-06-22', employee_id: 'QT-0567', manager_approved: 'Yes' },
        { training_program: 'Cloud Architecture (AWS)',       training_mode: 'Online',    preferred_date: '2026-06-25', employee_id: 'QT-0891', manager_approved: 'Pending' },
        { training_program: 'Agile & Scrum Certification',   training_mode: 'Hybrid',    preferred_date: '2026-07-01', employee_id: 'QT-1023', manager_approved: 'Yes' },
        { training_program: 'Effective Communication Skills', training_mode: 'Online',    preferred_date: '2026-07-05', employee_id: 'QT-1456', manager_approved: 'Yes' },
      ]
    ),

    mkChart('p6-c1', CX2[0], Y_ROW3T, CW2, CH, 'Completions by Program',  'column', 'training_form', 'training_program', 'employee_id', '#16a34a'),
    mkPdf  ('p6-pdf', CX2[1], Y_ROW3T, CW2, PH, 'Training Handbook',      'Q2 Training Handbook', 'QuantaOps L&D · Mandatory & Optional Programs'),
  ],

  // ── p7: IT Support Portal ────────────────────────────────────────────────────
  p7: [
    mkHeader('p7-h0', Y_H, 'IT Support Portal'),

    mkPanel('p7-k1', KX3[0], Y_KPI, KW3, 'Open Tickets',    '47',       'Unresolved issues',         '↓ 8 from yesterday',  'bug_report', '#ef4444'),
    mkPanel('p7-k2', KX3[1], Y_KPI, KW3, 'Critical Issues', '8',        'P1 & P2 severity',          'SLA breach risk',     'error',      '#b91c1c'),
    mkPanel('p7-k3', KX3[2], Y_KPI, KW3, 'Avg Resolution',  '2.3 days', 'Rolling 30-day average',    'SLA target: 3 days',  'speed',      '#16a34a'),

    mkTable('p7-t1', 0, Y_ROW2, CANVAS_W, TH, 'Active Ticket Queue', 'it_ticket_form',
      [
        { key: 'employee_id',    label: 'Raised By' },
        { key: 'issue_category', label: 'Category' },
        { key: 'issue_title',    label: 'Issue' },
        { key: 'severity',       label: 'Severity' },
        { key: 'affected_since', label: 'Reported On' },
      ],
      [
        { employee_id: 'QT-0345', issue_category: 'Hardware', issue_title: 'Laptop keyboard not working',        severity: 'P2', affected_since: '2026-06-15' },
        { employee_id: 'QT-0678', issue_category: 'Network',  issue_title: 'VPN connection dropping frequently', severity: 'P1', affected_since: '2026-06-16' },
        { employee_id: 'QT-0912', issue_category: 'Software', issue_title: 'MS Office license expired',          severity: 'P3', affected_since: '2026-06-14' },
        { employee_id: 'QT-1134', issue_category: 'Access',   issue_title: 'Unable to access ERP module',       severity: 'P2', affected_since: '2026-06-17' },
        { employee_id: 'QT-1567', issue_category: 'Email',    issue_title: 'Outlook sync not working',           severity: 'P3', affected_since: '2026-06-16' },
      ]
    ),

    mkChart('p7-c1', CX2[0], Y_ROW3T, CW2, CH, 'Tickets by Category',   'column', 'it_ticket_form', 'issue_category',  'employee_id', '#ef4444'),
    mkChart('p7-c2', CX2[1], Y_ROW3T, CW2, CH, 'Ticket Volume Trend',   'line',   'it_ticket_form', 'affected_since',  'employee_id', '#2563eb'),
  ],

  // ── p8: Travel & Expenses ────────────────────────────────────────────────────
  p8: [
    mkHeader('p8-h0', Y_H, 'Travel & Finance'),

    mkPanel('p8-k1', KX3[0], Y_KPI, KW3, 'Pending Claims',  '23',          'Awaiting approval',       'Oldest: 8 days',       'pending',  '#ca8a04'),
    mkPanel('p8-k2', KX3[1], Y_KPI, KW3, 'Total Claimed',   '₹4,82,500',  'This month',              '↑ 12% vs last month',  'payments', '#2563eb'),
    mkPanel('p8-k3', KX3[2], Y_KPI, KW3, 'Rejected',        '5',           'This month',              'Policy non-compliance', 'cancel',  '#ef4444'),

    mkTable('p8-t1', 0, Y_ROW2, CANVAS_W, TH, 'Expense Claims', 'travel_expense_form',
      [
        { key: 'employee_id',       label: 'Employee' },
        { key: 'travel_purpose',    label: 'Purpose' },
        { key: 'travel_from',       label: 'From' },
        { key: 'travel_to',         label: 'To' },
        { key: 'travel_date',       label: 'Travel Date' },
        { key: 'mode_of_transport', label: 'Mode' },
        { key: 'total_amount',      label: 'Amount (₹)' },
      ],
      [
        { employee_id: 'QT-0456', travel_purpose: 'Client Visit', travel_from: 'Bangalore', travel_to: 'Mumbai',    travel_date: '2026-06-12', mode_of_transport: 'Flight', total_amount: 18500 },
        { employee_id: 'QT-0789', travel_purpose: 'Training',     travel_from: 'Delhi',     travel_to: 'Hyderabad', travel_date: '2026-06-10', mode_of_transport: 'Flight', total_amount: 15200 },
        { employee_id: 'QT-1012', travel_purpose: 'Conference',   travel_from: 'Mumbai',    travel_to: 'Bangalore', travel_date: '2026-06-08', mode_of_transport: 'Flight', total_amount: 22800 },
        { employee_id: 'QT-1234', travel_purpose: 'Site Visit',   travel_from: 'Pune',      travel_to: 'Delhi',     travel_date: '2026-06-05', mode_of_transport: 'Train',  total_amount: 8400 },
        { employee_id: 'QT-1567', travel_purpose: 'Client Visit', travel_from: 'Chennai',   travel_to: 'Kolkata',   travel_date: '2026-06-03', mode_of_transport: 'Flight', total_amount: 19700 },
      ]
    ),

    mkChart('p8-c1', CX2[0], Y_ROW3T, CW2, CH, 'Expenses by Travel Purpose', 'bar',  'travel_expense_form', 'travel_purpose', 'total_amount', '#2563eb'),
    mkPdf  ('p8-pdf', CX2[1], Y_ROW3T, CW2, PH, 'Travel Policy',             'Travel & Expense Policy 2026', 'QuantaOps Finance Guidelines · Effective April 2026'),
  ],
};
