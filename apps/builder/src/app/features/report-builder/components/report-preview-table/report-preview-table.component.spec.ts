import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import {
  ReportPreviewTableComponent,
  TableState,
} from '@builder/features/report-builder/components/report-preview-table/report-preview-table.component';

describe('ReportPreviewTableComponent', () => {
  let fixture: ComponentFixture<ReportPreviewTableComponent>;
  let component: ReportPreviewTableComponent;

  const state: TableState = {
    columns: [],
    allColumns: [],
    groupedRows: [],
    rowHeight: 'comfortable',
    collapsedGroups: new Set<string>(),
    selectedRowIds: [],
    activeDetailRowId: null,
    columnMenuId: null,
    rowMenuId: null,
    visibilityMenuOpen: false,
    sortDescriptors: [],
    effectiveSortCriteria: [],
    groupConfig: null,
    groupColumnLabel: '',
    groupDirSymbol: '',
    rowActions: [],
    columnStyle: () => ({}),
    isColumnPinned: () => false,
    isColumnVisible: () => true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPreviewTableComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportPreviewTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('state', state);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits a typed table event', () => {
    let emitted: unknown;
    component.event.subscribe((e) => (emitted = e));
    component.event.emit({ type: 'selectAll', checked: true });
    expect(emitted).toEqual({ type: 'selectAll', checked: true });
  });
});
