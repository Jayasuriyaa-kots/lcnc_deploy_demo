import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Report } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private mockData: Report[] = [
    {
      id: 'rpt_1',
      name: 'Employee Directory',
      slug: 'employee-directory',
      appId: 'app_1',
      description: 'Browse employee records with search, filters, and detail drill-in.',
      sourceFormId: 'frm_1',
      sourceFormName: 'Employee Intake',
      binding: {
        dataSourceId: 'ds_hrms_prod',
        dataSourceLabel: 'qo_hrms_prod',
        entityId: 'employees',
        entityLabel: 'employees'
      },
      columns: [
        { id: 'c_1', label: 'Employee Code', fieldName: 'employeeCode', type: 'text', visible: true, sortable: true, filterable: true, width: 'sm', align: 'left' },
        { id: 'c_2', label: 'Full Name', fieldName: 'fullName', type: 'text', visible: true, sortable: true, filterable: true, width: 'lg', align: 'left' },
        { id: 'c_3', label: 'Email Address', fieldName: 'email', type: 'email', visible: true, sortable: true, filterable: true, width: 'lg', align: 'left' },
        { id: 'c_4', label: 'Department', fieldName: 'department', type: 'text', visible: true, sortable: true, filterable: true, width: 'md', align: 'left' },
        { id: 'c_5', label: 'Joining Date', fieldName: 'joiningDate', type: 'date', visible: false, sortable: true, filterable: true, width: 'md', align: 'left' }
      ],
      filters: [
        { id: 'flt_1', label: 'Active Only', enabled: true },
        { id: 'flt_2', label: 'This Month', enabled: false }
      ],
      actions: [
        { id: 'act_1', label: 'View', enabled: true },
        { id: 'act_2', label: 'Export', enabled: true },
        { id: 'act_3', label: 'Duplicate', enabled: true }
      ],
      settings: {
        defaultView: 'table',
        density: 'comfortable',
        showSearch: true,
        showFilters: true,
        showExport: true,
        showViewSwitcher: true,
        recordClickAction: 'open-detail',
        groupBy: '',
        sortBy: 'fullName'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rpt_2',
      name: 'Leave Status Board',
      slug: 'leave-status-board',
      appId: 'app_1',
      description: 'Track leave requests by employee, leave type, and approval outcome.',
      sourceFormId: 'frm_2',
      sourceFormName: 'Leave Request',
      binding: {
        dataSourceId: 'ds_hrms_prod',
        dataSourceLabel: 'qo_hrms_prod',
        entityId: 'leave_requests',
        entityLabel: 'leave_requests'
      },
      columns: [
        { id: 'c_6', label: 'Employee Name', fieldName: 'employeeName', type: 'text', visible: true, sortable: true, filterable: true, width: 'lg', align: 'left' },
        { id: 'c_7', label: 'Leave Type', fieldName: 'leaveType', type: 'status', visible: true, sortable: true, filterable: true, width: 'md', align: 'left' },
        { id: 'c_8', label: 'Start Date', fieldName: 'startDate', type: 'date', visible: true, sortable: true, filterable: true, width: 'md', align: 'left' },
        { id: 'c_9', label: 'End Date', fieldName: 'endDate', type: 'date', visible: true, sortable: true, filterable: true, width: 'md', align: 'left' }
      ],
      filters: [
        { id: 'flt_3', label: 'Approved', enabled: true },
        { id: 'flt_4', label: 'Pending', enabled: true }
      ],
      actions: [
        { id: 'act_4', label: 'View', enabled: true },
        { id: 'act_5', label: 'Export', enabled: false }
      ],
      settings: {
        defaultView: 'cards',
        density: 'compact',
        showSearch: true,
        showFilters: true,
        showExport: false,
        showViewSwitcher: true,
        recordClickAction: 'open-detail',
        groupBy: 'leaveType',
        sortBy: 'startDate'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  getReports(appId: string): Observable<Report[]> {
    return of(this.mockData.filter((report) => report.appId === appId).map((report) => this.clone(report))).pipe(delay(250));
  }

  saveReport(appId: string, payload: Report): Observable<Report> {
    const index = this.mockData.findIndex((item) => item.appId === appId && item.id === payload.id);
    const nextReport: Report = {
      ...this.clone(payload),
      appId,
      updatedAt: new Date().toISOString()
    };

    if (index === -1) {
      nextReport.createdAt = nextReport.createdAt || new Date().toISOString();
      this.mockData = [nextReport, ...this.mockData];
    } else {
      nextReport.createdAt = this.mockData[index].createdAt;
      this.mockData = this.mockData.map((item, itemIndex) => itemIndex === index ? nextReport : item);
    }

    return of(this.clone(nextReport)).pipe(delay(200));
  }

  private clone(report: Report): Report {
    return {
      ...report,
      binding: report.binding ? { ...report.binding } : undefined,
      columns: report.columns.map((column) => ({ ...column })),
      filters: report.filters.map((filter) => ({ ...filter })),
      actions: report.actions.map((action) => ({ ...action })),
      settings: { ...report.settings }
    };
  }
}
