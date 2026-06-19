import { signal } from '@angular/core';
import { LoginComponent } from './login.component';
import { AuthFacadeService } from '../../services/auth-facade.service';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('LoginComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(LoginComponent, {
      providers: [
        {
          provide: AuthFacadeService,
          useValue: {
            loading: signal(false),
            showValidationError: jasmine.createSpy('showValidationError'),
            login: jasmine.createSpy('login')
          }
        }
      ]
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
