import { AuditLogTableComponent } from './audit-log-table.component';
import {
  createSmokeFixture,
  smokeTestData
} from '../../../../testing/component-smoke-test.helpers';

describe('AuditLogTableComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(AuditLogTableComponent, {
      inputs: {
        records: smokeTestData.auditRecords
      }
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
