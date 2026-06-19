import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { PreferencesPageComponent } from '@builder/features/deployment/containers/preferences-page.component';
import { DeploymentFacadeService } from '@builder/features/deployment/facades/deployment.facade';

describe('PreferencesPageComponent', () => {
  let component: PreferencesPageComponent;
  let fixture: ComponentFixture<PreferencesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesPageComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: DeploymentFacadeService,
          useValue: {
            colourTokens: signal([]),
            behaviourSettings: signal([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
