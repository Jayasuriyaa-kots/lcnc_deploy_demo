import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import {
  ReportSearchDrawerComponent,
  SearchDrawerState,
} from '@builder/features/report-builder/components/report-search-drawer/report-search-drawer.component';

describe('ReportSearchDrawerComponent', () => {
  let fixture: ComponentFixture<ReportSearchDrawerComponent>;
  let component: ReportSearchDrawerComponent;

  const state: SearchDrawerState = {
    rows: [],
    operatorOptions: [{ value: 'eq', label: 'Equals' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSearchDrawerComponent],
      providers: [provideReportBuilderI18nTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportSearchDrawerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('state', state);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits an apply event', () => {
    let emitted: unknown;
    component.event.subscribe((e) => (emitted = e));
    component.event.emit({ type: 'apply' });
    expect(emitted).toEqual({ type: 'apply' });
  });
});
