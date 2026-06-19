import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'qo-top-header',
  standalone: true,
  template: `
    <header class="qo-top-header">
      <div class="qo-top-header-left">
        <h1 class="qo-top-header-title">{{ title() }}</h1>
        <ng-content select="[qo-header-left]"></ng-content>
      </div>

      <div class="qo-top-header-center">
        <ng-content select="[qo-header-center]"></ng-content>
      </div>

      <div class="qo-top-header-right">
        <ng-content select="[qo-header-right]"></ng-content>

        @if (userAvatar()) {
          <div class="qo-top-header-avatar">
            <img [src]="userAvatar()!" alt="User Avatar" />
          </div>
        } @else if (userName()) {
          <div class="qo-top-header-avatar qo-top-header-avatar-text">
            {{ userName()!.charAt(0).toUpperCase() }}
          </div>
        }
      </div>
    </header>
  `,
  styleUrl: './top-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoTopHeaderComponent {
  readonly title = input('');
  readonly userAvatar = input<string | undefined>(undefined);
  readonly userName = input<string | undefined>(undefined);
}
