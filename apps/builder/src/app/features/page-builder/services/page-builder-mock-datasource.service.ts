import { Injectable, computed, signal } from '@angular/core';

import propertyDbJson from '../../../../assets/mock-api/schema/datasources/property_db.json';
import flatsDatabaseJson from '../../../../assets/mock-api/schema/datasources/flats_database.json';

export interface PageBuilderMockDatasourceRow {
  id: string | number;
  [key: string]: unknown;
}

export interface PageBuilderMockDatasource {
  id: string;
  label: string;
  type: 'MOCK_JSON';
  data: PageBuilderMockDatasourceRow[];
}

export interface PageBuilderMockFieldOption {
  value: string;
  label: string;
}

export interface PageBuilderMockQueryOption {
  value: string;
  label: string;
  datasourceId: string;
  resultKind: 'query' | 'table';
}

export function getPageBuilderMockDatasources(): PageBuilderMockDatasource[] {
  return [
    {
      id: 'builder_runtime_demo',
      label: 'Builder Runtime Demo',
      type: 'MOCK_JSON',
      data: UNIFIED_WIDGET_DATASET,
    },
    {
      id: 'property',
      label: 'Property DB',
      type: 'MOCK_JSON',
      data: PROPERTY_ROWS,
    },
    {
      id: 'flats',
      label: 'Flats DB',
      type: 'MOCK_JSON',
      data: FLAT_ROWS,
    },
    {
      id: 'real_estate_hub',
      label: 'Real Estate Hub',
      type: 'MOCK_JSON',
      data: REAL_ESTATE_TABLE_OVERVIEW,
    },
    {
      id: 'hr_employees',
      label: 'HR — Employee Directory',
      type: 'MOCK_JSON',
      data: HR_EMPLOYEE_DATASET,
    },
    {
      id: 'hr_dashboard_metrics',
      label: 'HR — Dashboard Metrics',
      type: 'MOCK_JSON',
      data: HR_DASHBOARD_METRICS,
    },
    {
      id: 'hr_department_summary',
      label: 'HR — Department Summary',
      type: 'MOCK_JSON',
      data: HR_DEPARTMENT_SUMMARY,
    },
  ];
}

export function getPageBuilderMockDatasourceOptions(): Array<{ value: string; label: string }> {
  return getPageBuilderMockDatasources().map((datasource) => ({
    value: datasource.id,
    label: datasource.label,
  }));
}

export function getPageBuilderMockQueryOptions(): PageBuilderMockQueryOption[] {
  return QUERY_OPTIONS;
}

export function getPageBuilderMockDatasource(datasourceId: string): PageBuilderMockDatasource | null {
  return getPageBuilderMockDatasources().find((datasource) => datasource.id === datasourceId) ?? null;
}

export function getPageBuilderMockDatasourceKeys(datasourceId: string): string[] {
  const datasource = getPageBuilderMockDatasource(datasourceId);
  const firstRow = datasource?.data[0];

  if (!firstRow) {
    return [];
  }

  return Object.keys(firstRow);
}

export function getPageBuilderMockDatasourceRows(datasourceId: string): PageBuilderMockDatasourceRow[] {
  return getPageBuilderMockDatasource(datasourceId)?.data ?? [];
}

export function getPageBuilderMockDatasourceRow(datasourceId: string, recordId: string): PageBuilderMockDatasourceRow | null {
  if (!datasourceId) {
    return null;
  }

  const rows = getPageBuilderMockDatasourceRows(datasourceId);
  if (!rows.length) {
    return null;
  }

  if (!recordId.trim()) {
    return rows[0] ?? null;
  }

  return rows.find((row) => String(row.id) === recordId.trim()) ?? null;
}

export function getPageBuilderMockFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
  return getPageBuilderMockDatasourceKeys(datasourceId).map((key) => ({
    value: key,
    label: toMockDatasourceLabel(key),
  }));
}

export function getPageBuilderMockNumericFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
  const rows = getPageBuilderMockDatasourceRows(datasourceId);
  const keys = getPageBuilderMockDatasourceKeys(datasourceId);

  return keys
    .filter((key) => rows.some((row) => typeof row[key] === 'number'))
    .map((key) => ({
      value: key,
      label: toMockDatasourceLabel(key),
    }));
}

export function getPageBuilderMockTextFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
  const rows = getPageBuilderMockDatasourceRows(datasourceId);
  const keys = getPageBuilderMockDatasourceKeys(datasourceId);

  return keys
    .filter((key) => rows.some((row) => typeof row[key] === 'string'))
    .map((key) => ({
      value: key,
      label: toMockDatasourceLabel(key),
    }));
}

export function getPageBuilderMockDistinctValueOptions(
  datasourceId: string,
  field: string,
): Array<{ value: string; label: string }> {
  const values = new Set(
    getPageBuilderMockDatasourceRows(datasourceId)
      .map((row) => row[field])
      .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
      .map((value) => String(value)),
  );

  return [...values].map((value) => ({
    value,
    label: value,
  }));
}

export function getPageBuilderMockQueryRows(queryId: string): PageBuilderMockDatasourceRow[] {
  return QUERY_ROW_RESOLVERS[queryId]?.() ?? UNIFIED_WIDGET_DATASET;
}

function toMockDatasourceLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const PROPERTY_ROWS: PageBuilderMockDatasourceRow[] = (propertyDbJson as Array<Record<string, unknown>>).map((row, idx) => ({
  id: String(row['Property Code'] || idx),
  ...row,
}));

const FLAT_ROWS: PageBuilderMockDatasourceRow[] = (flatsDatabaseJson as Array<Record<string, unknown>>).map((row, idx) => ({
  id: String(row['ID'] || row['Flats Unique ID'] || idx),
  ...row,
}));

const UNIFIED_WIDGET_DATASET: PageBuilderMockDatasourceRow[] = [
  {
    id: 'asset-001',
    code: 'KOTS-001',
    display_name: 'KOTS Prime',
    short_label: 'Prime',
    category: 'Residential',
    department: 'Sales',
    city: 'Bengaluru',
    status: 'Available',
    owner_name: 'Aarav Mehta',
    role: 'Operations Lead',
    select_label: 'KOTS Prime',
    select_value: 'kots-prime',
    chart_group: 'Q1',
    units_sold: 24,
    revenue_lakhs: 182,
    occupancy_pct: 91,
    sort_order: 1,
    image_url: 'https://picsum.photos/id/10/600/400',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    pdf_url: 'https://www.africau.edu/images/default/sample.pdf',
    headline: 'Prime tower inventory is moving steadily this quarter.',
    caption: 'Front elevation preview',
  },
  {
    id: 'asset-002',
    code: 'KOTS-002',
    display_name: 'KOTS Elite',
    short_label: 'Elite',
    category: 'Residential',
    department: 'Marketing',
    city: 'Hyderabad',
    status: 'Booked',
    owner_name: 'Nisha Rao',
    role: 'Customer Success Manager',
    select_label: 'KOTS Elite',
    select_value: 'kots-elite',
    chart_group: 'Q1',
    units_sold: 18,
    revenue_lakhs: 146,
    occupancy_pct: 87,
    sort_order: 2,
    image_url: 'https://picsum.photos/id/20/600/400',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    pdf_url: 'https://example-files.online-convert.com/document/pdf/example.pdf',
    headline: 'Elite inventory is performing well with strong lead conversion.',
    caption: 'Clubhouse and landscaped entry',
  },
  {
    id: 'asset-003',
    code: 'KOTS-003',
    display_name: 'KOTS Luxury',
    short_label: 'Luxury',
    category: 'Commercial',
    department: 'Sales',
    city: 'Chennai',
    status: 'Available',
    owner_name: 'Megha Rao',
    role: 'Regional Manager',
    select_label: 'KOTS Luxury',
    select_value: 'kots-luxury',
    chart_group: 'Q2',
    units_sold: 31,
    revenue_lakhs: 228,
    occupancy_pct: 95,
    sort_order: 3,
    image_url: 'https://picsum.photos/id/30/600/400',
    video_url: 'https://www.w3schools.com/html/movie.mp4',
    pdf_url: 'https://www.africau.edu/images/default/sample.pdf',
    headline: 'Luxury commercial towers are driving the best revenue this quarter.',
    caption: 'Premium tower facade at sunset',
  },
  {
    id: 'asset-004',
    code: 'KOTS-004',
    display_name: 'KOTS Horizon',
    short_label: 'Horizon',
    category: 'Commercial',
    department: 'Finance',
    city: 'Pune',
    status: 'Maintenance',
    owner_name: 'Rohan Iyer',
    role: 'Finance Controller',
    select_label: 'KOTS Horizon',
    select_value: 'kots-horizon',
    chart_group: 'Q2',
    units_sold: 12,
    revenue_lakhs: 98,
    occupancy_pct: 78,
    sort_order: 4,
    image_url: 'https://picsum.photos/id/40/600/400',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    pdf_url: 'https://www.orimi.com/pdf-test.pdf',
    headline: 'Horizon needs attention due to lower occupancy and maintenance load.',
    caption: 'Mixed-use block under scheduled maintenance',
  },
];

const REAL_ESTATE_TABLE_OVERVIEW: PageBuilderMockDatasourceRow[] = [
  {
    id: 'table-properties',
    table_name: 'properties',
    table_label: 'Properties',
    record_count: PROPERTY_ROWS.length,
    primary_field: 'Property Code',
    description: 'Master property records',
  },
  {
    id: 'table-flats',
    table_name: 'flats',
    table_label: 'Flats',
    record_count: FLAT_ROWS.length,
    primary_field: 'Flats Unique ID',
    description: 'Flat inventory and occupancy details',
  },
];

const HR_EMPLOYEE_DATASET: PageBuilderMockDatasourceRow[] = [
  { id: 'EMP-0001', employee_code: 'EMP-0001', full_name: 'Priya Sharma',       department: 'HR',           city: 'Bengaluru',  joining_date: '2023-01-10', employment_type: 'Full Time', status: 'Active',   salary_band: '12.5' },
  { id: 'EMP-0002', employee_code: 'EMP-0002', full_name: 'Rahul Mehta',         department: 'Engineering',  city: 'Mumbai',     joining_date: '2022-06-15', employment_type: 'Full Time', status: 'Active',   salary_band: '18.0' },
  { id: 'EMP-0003', employee_code: 'EMP-0003', full_name: 'Ananya Krishnan',     department: 'Product',      city: 'Hyderabad',  joining_date: '2021-11-03', employment_type: 'Full Time', status: 'Active',   salary_band: '16.5' },
  { id: 'EMP-0004', employee_code: 'EMP-0004', full_name: 'Vikram Nair',         department: 'Sales',        city: 'Chennai',    joining_date: '2023-04-22', employment_type: 'Full Time', status: 'Active',   salary_band: '14.0' },
  { id: 'EMP-0005', employee_code: 'EMP-0005', full_name: 'Neha Gupta',          department: 'Finance',      city: 'Pune',       joining_date: '2020-09-01', employment_type: 'Full Time', status: 'On Leave', salary_band: '15.5' },
  { id: 'EMP-0006', employee_code: 'EMP-0006', full_name: 'Arjun Patel',         department: 'Engineering',  city: 'Bengaluru',  joining_date: '2022-03-14', employment_type: 'Full Time', status: 'Active',   salary_band: '19.5' },
  { id: 'EMP-0007', employee_code: 'EMP-0007', full_name: 'Kavitha Reddy',       department: 'Operations',   city: 'Hyderabad',  joining_date: '2021-07-27', employment_type: 'Full Time', status: 'Active',   salary_band: '13.5' },
  { id: 'EMP-0008', employee_code: 'EMP-0008', full_name: 'Suresh Babu',         department: 'IT Support',   city: 'Chennai',    joining_date: '2023-08-05', employment_type: 'Full Time', status: 'Active',   salary_band: '11.0' },
  { id: 'EMP-0009', employee_code: 'EMP-0009', full_name: 'Divya Iyer',          department: 'Data Science', city: 'Bengaluru',  joining_date: '2022-12-19', employment_type: 'Full Time', status: 'Active',   salary_band: '20.5' },
  { id: 'EMP-0010', employee_code: 'EMP-0010', full_name: 'Rohan Joshi',         department: 'Marketing',    city: 'Mumbai',     joining_date: '2021-02-08', employment_type: 'Full Time', status: 'Active',   salary_band: '13.0' },
  { id: 'EMP-0011', employee_code: 'EMP-0011', full_name: 'Meena Saxena',        department: 'Legal',        city: 'Delhi',      joining_date: '2020-05-30', employment_type: 'Full Time', status: 'Active',   salary_band: '22.0' },
  { id: 'EMP-0012', employee_code: 'EMP-0012', full_name: 'Aditya Kumar',        department: 'Engineering',  city: 'Noida',      joining_date: '2023-07-11', employment_type: 'Full Time', status: 'Active',   salary_band: '17.0' },
  { id: 'EMP-0013', employee_code: 'EMP-0013', full_name: 'Pooja Verma',         department: 'HR',           city: 'Mumbai',     joining_date: '2022-10-25', employment_type: 'Full Time', status: 'Active',   salary_band: '11.5' },
  { id: 'EMP-0014', employee_code: 'EMP-0014', full_name: 'Kiran Rao',           department: 'Finance',      city: 'Bengaluru',  joining_date: '2021-03-18', employment_type: 'Full Time', status: 'Active',   salary_band: '16.0' },
  { id: 'EMP-0015', employee_code: 'EMP-0015', full_name: 'Sunita Mishra',       department: 'Operations',   city: 'Delhi',      joining_date: '2020-11-12', employment_type: 'Full Time', status: 'Active',   salary_band: '14.5' },
  { id: 'EMP-0016', employee_code: 'EMP-0016', full_name: 'Deepak Chatterjee',   department: 'Data Science', city: 'Kolkata',    joining_date: '2023-02-28', employment_type: 'Full Time', status: 'Active',   salary_band: '19.0' },
  { id: 'EMP-0017', employee_code: 'EMP-0017', full_name: 'Riya Singh',          department: 'Marketing',    city: 'Pune',       joining_date: '2022-08-09', employment_type: 'Full Time', status: 'Active',   salary_band: '12.0' },
  { id: 'EMP-0018', employee_code: 'EMP-0018', full_name: 'Amit Desai',          department: 'Sales',        city: 'Ahmedabad',  joining_date: '2021-06-14', employment_type: 'Full Time', status: 'Active',   salary_band: '13.5' },
  { id: 'EMP-0019', employee_code: 'EMP-0019', full_name: 'Shweta Pillai',       department: 'Product',      city: 'Bengaluru',  joining_date: '2023-05-03', employment_type: 'Full Time', status: 'Active',   salary_band: '17.5' },
  { id: 'EMP-0020', employee_code: 'EMP-0020', full_name: 'Rajesh Naik',         department: 'IT Support',   city: 'Mumbai',     joining_date: '2020-08-21', employment_type: 'Full Time', status: 'Active',   salary_band: '12.0' },
  { id: 'EMP-0021', employee_code: 'EMP-0021', full_name: 'Swathi Menon',        department: 'Legal',        city: 'Chennai',    joining_date: '2022-01-17', employment_type: 'Full Time', status: 'Active',   salary_band: '21.0' },
  { id: 'EMP-0022', employee_code: 'EMP-0022', full_name: 'Ganesh Patil',        department: 'Engineering',  city: 'Pune',       joining_date: '2023-09-06', employment_type: 'Contract',  status: 'Active',   salary_band: '15.0' },
  { id: 'EMP-0023', employee_code: 'EMP-0023', full_name: 'Lakshmi Venkat',      department: 'HR',           city: 'Hyderabad',  joining_date: '2021-04-29', employment_type: 'Full Time', status: 'Active',   salary_band: '13.0' },
  { id: 'EMP-0024', employee_code: 'EMP-0024', full_name: 'Nikhil Bose',         department: 'Finance',      city: 'Kolkata',    joining_date: '2022-07-22', employment_type: 'Full Time', status: 'Active',   salary_band: '14.5' },
  { id: 'EMP-0025', employee_code: 'EMP-0025', full_name: 'Anushka Tiwari',      department: 'Marketing',    city: 'Delhi',      joining_date: '2020-12-07', employment_type: 'Full Time', status: 'Active',   salary_band: '11.5' },
  { id: 'EMP-0026', employee_code: 'EMP-0026', full_name: 'Sanjay Hegde',        department: 'Operations',   city: 'Bengaluru',  joining_date: '2023-03-15', employment_type: 'Full Time', status: 'Active',   salary_band: '15.0' },
  { id: 'EMP-0027', employee_code: 'EMP-0027', full_name: 'Madhuri Nambiar',     department: 'Product',      city: 'Noida',      joining_date: '2021-09-11', employment_type: 'Full Time', status: 'Active',   salary_band: '18.0' },
  { id: 'EMP-0028', employee_code: 'EMP-0028', full_name: 'Pavan Kumar',         department: 'Data Science', city: 'Hyderabad',  joining_date: '2022-05-04', employment_type: 'Full Time', status: 'Active',   salary_band: '21.5' },
  { id: 'EMP-0029', employee_code: 'EMP-0029', full_name: 'Divyashree M S',      department: 'Sales',        city: 'Bengaluru',  joining_date: '2023-06-20', employment_type: 'Full Time', status: 'Active',   salary_band: '13.0' },
  { id: 'EMP-0030', employee_code: 'EMP-0030', full_name: 'Rohit Shetty',        department: 'IT Support',   city: 'Mumbai',     joining_date: '2021-01-25', employment_type: 'Full Time', status: 'On Leave', salary_band: '11.5' },
];

const HR_DASHBOARD_METRICS: PageBuilderMockDatasourceRow[] = [
  { id: 'metric-1', metric_name: 'Total Headcount',       value: 10432, unit: 'employees', change_pct: 8.4,  trend: 'up',   chart_group: 'Workforce' },
  { id: 'metric-2', metric_name: 'Active Employees',      value: 9876,  unit: 'employees', change_pct: 7.1,  trend: 'up',   chart_group: 'Workforce' },
  { id: 'metric-3', metric_name: 'Open Positions',        value: 226,   unit: 'positions', change_pct: -12.3, trend: 'down', chart_group: 'Recruitment' },
  { id: 'metric-4', metric_name: 'Avg Attrition Rate',    value: 8.9,   unit: '%',         change_pct: -1.2, trend: 'down', chart_group: 'Retention' },
  { id: 'metric-5', metric_name: 'Avg Tenure',            value: 3.8,   unit: 'years',     change_pct: 0.3,  trend: 'up',   chart_group: 'Retention' },
  { id: 'metric-6', metric_name: 'Leaves Pending',        value: 47,    unit: 'requests',  change_pct: 5.0,  trend: 'up',   chart_group: 'Leave' },
  { id: 'metric-7', metric_name: 'IT Tickets Open',       value: 83,    unit: 'tickets',   change_pct: -18.0, trend: 'down', chart_group: 'IT Support' },
  { id: 'metric-8', metric_name: 'Training Enrollments',  value: 312,   unit: 'employees', change_pct: 22.0, trend: 'up',   chart_group: 'Learning' },
];

const HR_DEPARTMENT_SUMMARY: PageBuilderMockDatasourceRow[] = [
  { id: 'dept-1',  department: 'Engineering',  headcount: 2841, open_positions: 47, avg_salary_l: 19.2, attrition_pct: 8.4  },
  { id: 'dept-2',  department: 'Sales',        headcount: 1523, open_positions: 62, avg_salary_l: 13.8, attrition_pct: 14.1 },
  { id: 'dept-3',  department: 'Operations',   headcount: 1204, open_positions: 18, avg_salary_l: 14.2, attrition_pct: 6.2  },
  { id: 'dept-4',  department: 'Product',      headcount: 874,  open_positions: 23, avg_salary_l: 17.8, attrition_pct: 7.5  },
  { id: 'dept-5',  department: 'Finance',      headcount: 643,  open_positions: 9,  avg_salary_l: 15.9, attrition_pct: 4.8  },
  { id: 'dept-6',  department: 'HR',           headcount: 521,  open_positions: 14, avg_salary_l: 12.3, attrition_pct: 9.1  },
  { id: 'dept-7',  department: 'Marketing',    headcount: 487,  open_positions: 11, avg_salary_l: 12.5, attrition_pct: 11.3 },
  { id: 'dept-8',  department: 'Data Science', headcount: 412,  open_positions: 31, avg_salary_l: 20.4, attrition_pct: 10.7 },
  { id: 'dept-9',  department: 'IT Support',   headcount: 368,  open_positions: 8,  avg_salary_l: 11.8, attrition_pct: 5.9  },
  { id: 'dept-10', department: 'Legal',        headcount: 127,  open_positions: 3,  avg_salary_l: 21.5, attrition_pct: 3.2  },
];

const QUERY_ROW_RESOLVERS: Record<string, () => PageBuilderMockDatasourceRow[]> = {
  chart_execution_query: () =>
    UNIFIED_WIDGET_DATASET.map((row) => ({
      id: row['id'],
      city: row['city'],
      chart_group: row['chart_group'],
      category: row['category'],
      department: row['department'],
      units_sold: row['units_sold'],
      revenue_lakhs: row['revenue_lakhs'],
      occupancy_pct: row['occupancy_pct'],
      sort_order: row['sort_order'],
      status: row['status'],
    })),
  table_execution_query: () =>
    UNIFIED_WIDGET_DATASET.filter((row) => row['status'] !== 'Maintenance').map((row) => ({
      id: row['id'],
      code: row['code'],
      display_name: row['display_name'],
      short_label: row['short_label'],
      category: row['category'],
      department: row['department'],
      city: row['city'],
      status: row['status'],
    })),
  image_execution_query: () =>
    UNIFIED_WIDGET_DATASET.filter((row) => row['status'] === 'Available').map((row) => ({
      id: row['id'],
      display_name: row['display_name'],
      title: row['display_name'],
      caption: row['caption'],
      image_url: row['image_url'],
      video_url: row['video_url'],
      pdf_url: row['pdf_url'],
      category: row['category'],
      city: row['city'],
      status: row['status'],
    })),
  asset_inventory_table: () => UNIFIED_WIDGET_DATASET,
  all_properties: () => PROPERTY_ROWS,
  available_properties: () =>
    PROPERTY_ROWS.filter((row) => {
      const status = String(row['Property Status'] ?? row['Status'] ?? row['status'] ?? '').toLowerCase();
      return status.includes('available') || status.includes('active');
    }),
  all_flats: () => FLAT_ROWS,
  vacant_flats: () =>
    FLAT_ROWS.filter((row) => {
      const status = String(row['Status'] ?? row['Occupancy Status'] ?? row['status'] ?? '').toLowerCase();
      return status.includes('vacant');
    }),
  real_estate_tables: () => REAL_ESTATE_TABLE_OVERVIEW,
  properties_table: () => PROPERTY_ROWS,
  flats_table: () => FLAT_ROWS,
  hr_all_employees: () => HR_EMPLOYEE_DATASET,
  hr_active_employees: () => HR_EMPLOYEE_DATASET.filter((r) => r['status'] === 'Active'),
  hr_employees_by_dept: () => HR_DEPARTMENT_SUMMARY,
  hr_dashboard_kpis: () => HR_DASHBOARD_METRICS,
  hr_workforce_metrics: () => HR_DASHBOARD_METRICS.filter((r) => r['chart_group'] === 'Workforce'),
  hr_retention_metrics: () => HR_DASHBOARD_METRICS.filter((r) => r['chart_group'] === 'Retention'),
};

const QUERY_OPTIONS: PageBuilderMockQueryOption[] = [
  { value: 'chart_execution_query', label: 'Chart Execution Query', datasourceId: 'builder_runtime_demo', resultKind: 'query' },
  { value: 'table_execution_query', label: 'Table Execution Query', datasourceId: 'builder_runtime_demo', resultKind: 'query' },
  { value: 'image_execution_query', label: 'Image Execution Query', datasourceId: 'builder_runtime_demo', resultKind: 'query' },
  { value: 'asset_inventory_table', label: 'Asset Inventory Table', datasourceId: 'builder_runtime_demo', resultKind: 'table' },
  { value: 'all_properties', label: 'All Properties Query', datasourceId: 'property', resultKind: 'query' },
  { value: 'available_properties', label: 'Available Properties Query', datasourceId: 'property', resultKind: 'query' },
  { value: 'all_flats', label: 'All Flats Query', datasourceId: 'flats', resultKind: 'query' },
  { value: 'vacant_flats', label: 'Vacant Flats Query', datasourceId: 'flats', resultKind: 'query' },
  { value: 'real_estate_tables', label: 'Real Estate Tables', datasourceId: 'real_estate_hub', resultKind: 'table' },
  { value: 'properties_table', label: 'Properties Table', datasourceId: 'real_estate_hub', resultKind: 'table' },
  { value: 'flats_table', label: 'Flats Table', datasourceId: 'real_estate_hub', resultKind: 'table' },
  { value: 'hr_all_employees', label: 'All Employees', datasourceId: 'hr_employees', resultKind: 'query' },
  { value: 'hr_active_employees', label: 'Active Employees', datasourceId: 'hr_employees', resultKind: 'query' },
  { value: 'hr_employees_by_dept', label: 'Employees by Department', datasourceId: 'hr_department_summary', resultKind: 'query' },
  { value: 'hr_dashboard_kpis', label: 'HR Dashboard KPIs', datasourceId: 'hr_dashboard_metrics', resultKind: 'query' },
  { value: 'hr_workforce_metrics', label: 'Workforce Metrics', datasourceId: 'hr_dashboard_metrics', resultKind: 'query' },
  { value: 'hr_retention_metrics', label: 'Retention Metrics', datasourceId: 'hr_dashboard_metrics', resultKind: 'query' },
];

@Injectable({ providedIn: 'root' })
export class PageBuilderMockDatasourceService {
  readonly datasources = signal<PageBuilderMockDatasource[]>(getPageBuilderMockDatasources());

  readonly datasourceOptions = computed(() => getPageBuilderMockDatasourceOptions());

  getDatasource(datasourceId: string): PageBuilderMockDatasource | null {
    return getPageBuilderMockDatasource(datasourceId);
  }

  getDatasourceKeys(datasourceId: string): string[] {
    return getPageBuilderMockDatasourceKeys(datasourceId);
  }

  getDatasourceRows(datasourceId: string): PageBuilderMockDatasourceRow[] {
    return getPageBuilderMockDatasourceRows(datasourceId);
  }

  getDatasourceRow(datasourceId: string, recordId: string): PageBuilderMockDatasourceRow | null {
    return getPageBuilderMockDatasourceRow(datasourceId, recordId);
  }

  getFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
    return getPageBuilderMockFieldOptions(datasourceId);
  }

  getNumericFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
    return getPageBuilderMockNumericFieldOptions(datasourceId);
  }

  getTextFieldOptions(datasourceId: string): PageBuilderMockFieldOption[] {
    return getPageBuilderMockTextFieldOptions(datasourceId);
  }

  getDistinctValueOptions(datasourceId: string, field: string): Array<{ value: string; label: string }> {
    return getPageBuilderMockDistinctValueOptions(datasourceId, field);
  }

  getQueryOptions(): PageBuilderMockQueryOption[] {
    return getPageBuilderMockQueryOptions();
  }

  getQueryRows(queryId: string): PageBuilderMockDatasourceRow[] {
    return getPageBuilderMockQueryRows(queryId);
  }

  private toLabel(value: string): string {
    return toMockDatasourceLabel(value);
  }
}
