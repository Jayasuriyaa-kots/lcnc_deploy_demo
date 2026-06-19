import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QoSize } from '@qo/ui-components/lib/base';

@Component({
  selector: 'qo-avatar-badge',
  standalone: true,
  template: `
    <div class="qo-avatar-badge" [class.qo-avatar-badge-sm]="size() === 'sm'">
      {{ initials() }}
    </div>
  `,
  styleUrl: './avatar-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoAvatarBadgeComponent {
  name = input.required<string>();
  size = input<QoSize>('md');

  initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  );
}
