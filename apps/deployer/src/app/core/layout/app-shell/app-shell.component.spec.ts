import { AppShellComponent } from './app-shell.component';
import { createSmokeFixture } from '../../../testing/component-smoke-test.helpers';

describe('AppShellComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AppShellComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
