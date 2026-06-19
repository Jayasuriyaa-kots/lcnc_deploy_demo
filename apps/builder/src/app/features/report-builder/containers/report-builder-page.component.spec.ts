import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ReportBuilderPageComponent } from '@builder/features/report-builder/containers/report-builder-page.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';
import { QoToastService } from '@qo/ui-components';

describe('ReportBuilderPageComponent', () => {
  let fixture: ComponentFixture<ReportBuilderPageComponent>;
  let component: ReportBuilderPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBuilderPageComponent],
      providers: [
        provideReportBuilderI18nTesting(),
        ReportBuilderFacade,
        {
          provide: QoToastService,
          useValue: jasmine.createSpyObj('QoToastService', ['success']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportBuilderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
