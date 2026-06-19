import { Injectable, computed, signal } from '@angular/core';
import { injectBrowserStorage } from '@builder/core/services/browser-storage.service';

export interface QueryReferenceUsage {
  module: string;
  page: string;
}

export interface QueryReferenceRecord {
  id: string;
  name: string;
  datasourceId: string;
  datasourceName: string;
  queryType: string;
  query: string;
  columns: string[];
  mockData: Array<Record<string, string | number | boolean | null>>;
  usedIn: QueryReferenceUsage[];
  active: boolean;
}

export interface QueryReferenceBinding {
  componentId: string;
  queryRefId: string;
  page: string;
}

export interface QueryMockResult {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
}

@Injectable({ providedIn: 'root' })
export class QueryRegistryService {
  readonly storageKey = 'hrms_builder_saved_queries';
  readonly formBindingsStorageKey = 'hrms_builder_form_bindings';
  readonly reportBindingsStorageKey = 'hrms_builder_report_bindings';

  private readonly storage = injectBrowserStorage();
  private readonly queriesState = signal<QueryReferenceRecord[]>(this.loadQueries());

  readonly queries = computed(() => this.queriesState());
  readonly activeQueries = computed(() =>
    this.queriesState().filter((query, index, queries) =>
      query.active !== false &&
      queries.findIndex((item) => item.id === query.id) === index
    )
  );

  reload(): void {
    this.queriesState.set(this.loadQueries());
  }

  getQueryById(queryId: string | null | undefined): QueryReferenceRecord | null {
    if (!queryId) {
      return null;
    }

    return this.queriesState().find((query) => query.id === queryId) ?? null;
  }

  hasDuplicateName(datasourceId: string, name: string, excludeId?: string): boolean {
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) {
      return false;
    }

    return this.queriesState().some((query) =>
      query.id !== excludeId &&
      query.datasourceId === datasourceId &&
      query.name.trim().toLowerCase() === normalizedName
    );
  }

  generateMockResult(queryText: string): QueryMockResult {
    const normalized = this.normalizeQueryText(queryText);
    const tableName = this.extractTableName(normalized);
    const target = tableName || normalized;

    if (this.matchesQueryTarget(target, ['employee attendance', 'employeeattendance', 'attendance'])) {
      return {
        columns: ['ID', 'EMPLOYEE_NAME', 'DATE', 'STATUS', 'CHECK_IN', 'CHECK_OUT'],
        rows: [
          {
            ID: 1,
            EMPLOYEE_NAME: 'Alice Johnson',
            DATE: '2026-05-26',
            STATUS: 'Present',
            CHECK_IN: '09:15 AM',
            CHECK_OUT: '06:10 PM',
          },
          {
            ID: 2,
            EMPLOYEE_NAME: 'Bob Smith',
            DATE: '2026-05-26',
            STATUS: 'Absent',
            CHECK_IN: '-',
            CHECK_OUT: '-',
          },
        ],
      };
    }

    if (this.matchesQueryTarget(target, ['active employees', 'activeemployees'])) {
      return {
        columns: ['ID', 'NAME', 'EMAIL', 'STATUS'],
        rows: [
          { ID: 1, NAME: 'Alice Johnson', EMAIL: 'alice@co.com', STATUS: 'Active' },
          { ID: 2, NAME: 'Bob Smith', EMAIL: 'bob@co.com', STATUS: 'Active' },
        ],
      };
    }

    if (this.matchesQueryTarget(target, ['users', 'user'])) {
      return {
        columns: ['ID', 'NAME', 'EMAIL'],
        rows: [
          { ID: 1, NAME: 'Alice Johnson', EMAIL: 'alice@co.com' },
          { ID: 2, NAME: 'Bob Smith', EMAIL: 'bob@co.com' },
        ],
      };
    }

    if (this.matchesQueryTarget(target, ['department', 'departments', 'department list', 'departmentlist'])) {
      return {
        columns: ['ID', 'DEPARTMENT_NAME', 'HEAD', 'LOCATION'],
        rows: [
          { ID: 1, DEPARTMENT_NAME: 'Human Resources', HEAD: 'Meera Nair', LOCATION: 'Bengaluru' },
          { ID: 2, DEPARTMENT_NAME: 'Engineering', HEAD: 'Arjun Shah', LOCATION: 'Hyderabad' },
        ],
      };
    }

    return {
      columns: ['ID', 'RESULT'],
      rows: [{ ID: 1, RESULT: 'Mock result generated' }],
    };
  }

  saveQuery(record: Omit<QueryReferenceRecord, 'usedIn'> & { usedIn?: QueryReferenceUsage[] }): void {
    const nextRecord: QueryReferenceRecord = {
      ...record,
      usedIn: record.usedIn ? [...record.usedIn] : [],
    };

    const existing = this.readQueries();
    const nextQueries = existing.some((query) => query.id === nextRecord.id)
      ? existing.map((query) => (query.id === nextRecord.id ? nextRecord : query))
      : [nextRecord, ...existing];

    this.writeQueries(nextQueries);
  }

  deleteQuery(queryId: string): void {
    const nextQueries = this.readQueries().filter((query) => query.id !== queryId);
    this.writeQueries(nextQueries);
    this.clearBindingsForQueryIds([queryId]);
  }

  deleteQueriesForDatasource(datasourceId: string): void {
    const existing = this.readQueries();
    const removedIds = existing
      .filter((query) => query.datasourceId === datasourceId)
      .map((query) => query.id);

    if (!removedIds.length) {
      return;
    }

    this.writeQueries(existing.filter((query) => query.datasourceId !== datasourceId));
    this.clearBindingsForQueryIds(removedIds);
  }

  setQueryActive(queryId: string, active: boolean): void {
    const nextQueries = this.readQueries().map((query) =>
      query.id === queryId ? { ...query, active } : query
    );
    this.writeQueries(nextQueries);
  }

  syncFormBindings(bindings: QueryReferenceBinding[]): void {
    this.storage.setJson(this.formBindingsStorageKey, bindings);
    this.recomputeUsage();
  }

  syncReportBindings(bindings: QueryReferenceBinding[]): void {
    this.storage.setJson(this.reportBindingsStorageKey, bindings);
    this.recomputeUsage();
  }

  readFormBindings(): QueryReferenceBinding[] {
    return this.readBindings(this.formBindingsStorageKey);
  }

  readReportBindings(): QueryReferenceBinding[] {
    return this.readBindings(this.reportBindingsStorageKey);
  }

  clearBindingsForQueryIds(queryIds: string[]): void {
    const blocked = new Set(queryIds);
    const nextFormBindings = this.readFormBindings().filter((binding) => !blocked.has(binding.queryRefId));
    const nextReportBindings = this.readReportBindings().filter((binding) => !blocked.has(binding.queryRefId));

    this.storage.setJson(this.formBindingsStorageKey, nextFormBindings);
    this.storage.setJson(this.reportBindingsStorageKey, nextReportBindings);
    this.recomputeUsage();
  }

  private loadQueries(): QueryReferenceRecord[] {
    const saved = this.readQueries();
    if (saved.length > 0) {
      return saved;
    }

    const seeded = this.createSeedQueries();
    this.writeQueries(seeded);
    return seeded;
  }

  private readQueries(): QueryReferenceRecord[] {
    const parsed = this.storage.getJson<QueryReferenceRecord[]>(this.storageKey);
    return Array.isArray(parsed) ? parsed : [];
  }

  private writeQueries(queries: QueryReferenceRecord[]): void {
    this.storage.setJson(this.storageKey, queries);
    this.queriesState.set(queries);
    this.recomputeUsage();
  }

  private recomputeUsage(): void {
    const formBindings = this.readFormBindings();
    const reportBindings = this.readReportBindings();
    const nextQueries = this.readQueries().map((query) => ({
      ...query,
      usedIn: [
        ...formBindings
          .filter((binding) => binding.queryRefId === query.id)
          .map((binding) => ({ module: 'Form Builder', page: binding.page })),
        ...reportBindings
          .filter((binding) => binding.queryRefId === query.id)
          .map((binding) => ({ module: 'Report Builder', page: binding.page })),
      ],
    }));

    this.storage.setJson(this.storageKey, nextQueries);
    this.queriesState.set(nextQueries);
  }

  private readBindings(key: string): QueryReferenceBinding[] {
    const parsed = this.storage.getJson<QueryReferenceBinding[]>(key);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((binding) => binding.queryRefId && binding.componentId);
  }

  private createSeedQueries(): QueryReferenceRecord[] {
    const activeEmployees = this.generateMockResult('SELECT * FROM Active Employees LIMIT 10;');
    const attendance = this.generateMockResult('SELECT * FROM Employee Attendance LIMIT 10;');
    const departments = this.generateMockResult('SELECT * FROM Department LIMIT 10;');

    return [
      {
        id: 'query_active_employees',
        name: 'Active Employees',
        datasourceId: 'qo-hrms-prod',
        datasourceName: 'qo_hrms_prod',
        queryType: 'SQL',
        query: 'SELECT * FROM Active Employees LIMIT 10;',
        columns: activeEmployees.columns,
        mockData: activeEmployees.rows,
        usedIn: [],
        active: true,
      },
      {
        id: 'query_employee_attendance',
        name: 'Employee Attendance',
        datasourceId: 'attendance-api',
        datasourceName: 'Attendance API',
        queryType: 'SQL',
        query: 'SELECT * FROM Employee Attendance LIMIT 10;',
        columns: attendance.columns,
        mockData: attendance.rows,
        usedIn: [],
        active: true,
      },
      {
        id: 'query_department_list',
        name: 'Department List',
        datasourceId: 'qo-hrms-prod',
        datasourceName: 'qo_hrms_prod',
        queryType: 'SQL',
        query: 'SELECT * FROM Department LIMIT 10;',
        columns: departments.columns,
        mockData: departments.rows,
        usedIn: [],
        active: true,
      },
    ];
  }

  private normalizeQueryText(queryText: string): string {
    return String(queryText ?? '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTableName(normalizedQueryText: string): string {
    const match = normalizedQueryText.match(/from\s+([a-z0-9_ ]+?)(\s+where|\s+limit|\s+order|\s+group|;|$)/);
    return match?.[1]?.trim() ?? '';
  }

  private matchesQueryTarget(target: string, candidates: string[]): boolean {
    const normalizedTarget = target.replace(/\s+/g, ' ').trim();
    const compactTarget = normalizedTarget.replace(/\s+/g, '');

    return candidates.some((candidate) => {
      const normalizedCandidate = candidate.replace(/\s+/g, ' ').trim();
      const compactCandidate = normalizedCandidate.replace(/\s+/g, '');
      return normalizedTarget.includes(normalizedCandidate) || compactTarget.includes(compactCandidate);
    });
  }
}
