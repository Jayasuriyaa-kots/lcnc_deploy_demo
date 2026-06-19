import { ChangeDetectionStrategy, Component, input, output, OnInit, OnDestroy} from '@angular/core';
import { QoIconComponent } from '@qo/ui-components/lib/primitives/icon/icon.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'qo-toast',
  standalone: true,
  imports: [QoIconComponent],
  template: `
    <div class="qo-toast" [class]="'qo-toast-' + type()">
      <div class="qo-toast-icon">
        <qo-icon [name]="iconName"></qo-icon>
      </div>
      <div class="qo-toast-content">
        <div class="qo-toast-title">{{ title() }}</div>
        @if (message()) {
          <div class="qo-toast-message">{{ message() }}</div>
        }
      </div>
      <button class="qo-toast-close" (click)="close.emit()">
        <qo-icon name="x" size="sm"></qo-icon>
      </button>
    </div>
  `,
  styleUrl: './toast.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoToastComponent implements OnInit, OnDestroy {
  type = input<ToastType>('info');
  title = input.required<string>();
  message = input<string | undefined>(undefined);
  duration = input<number>(3000);
  
  close = output<void>();

  private timeoutId?: ReturnType<typeof setTimeout>;

  get iconName(): string {
    switch (this.type()) {
      case 'success': return 'check';
      case 'error': return 'x';
      case 'warning': return 'info';
      case 'info': return 'info';
    }
  }

  ngOnInit(): void {
    if (this.duration() > 0) {
      this.timeoutId = setTimeout(() => {
        this.close.emit();
      }, this.duration());
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

