import { TestBed } from '@angular/core/testing';
import { QoConnectorIconComponent } from './connector-icon.component';

describe('QoConnectorIconComponent', () => {
  it('creates the connector icon component', async () => {
    await TestBed.configureTestingModule({ imports: [QoConnectorIconComponent] }).compileComponents();
    expect(TestBed.createComponent(QoConnectorIconComponent).componentInstance).toBeTruthy();
  });
});
