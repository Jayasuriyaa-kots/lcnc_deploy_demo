import { TestBed } from '@angular/core/testing';
import { QoStatCardComponent } from './stat-card.component';

describe('QoStatCardComponent', () => {
  it('creates the stat card component', async () => {
    await TestBed.configureTestingModule({ imports: [QoStatCardComponent] }).compileComponents();
    expect(TestBed.createComponent(QoStatCardComponent).componentInstance).toBeTruthy();
  });
});
