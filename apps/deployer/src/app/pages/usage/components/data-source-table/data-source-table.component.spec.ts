import { DataSourceTableComponent } from './data-source-table.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('DataSourceTableComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(DataSourceTableComponent, {
      inputs: {
        sources: smokeTestData.usageSources
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
