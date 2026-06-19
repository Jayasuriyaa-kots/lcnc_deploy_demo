import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideReportBuilderI18nTesting } from '@builder/features/report-builder/testing/report-builder-i18n.testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportPreviewPageComponent } from './report-preview-page.component';
import { ReportBuilderFacade } from '@builder/features/report-builder/facades/report-builder.facade';

describe('ReportPreviewPageComponent', () => {
  let fixture: ComponentFixture<ReportPreviewPageComponent>;
  let component: ReportPreviewPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportPreviewPageComponent],
      providers: [
        provideReportBuilderI18nTesting(),
        ReportBuilderFacade,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportPreviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
