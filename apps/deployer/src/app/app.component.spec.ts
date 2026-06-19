import { AppComponent } from './app.component';
import { createSmokeFixture } from './testing/component-smoke-test.helpers';

describe('AppComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
