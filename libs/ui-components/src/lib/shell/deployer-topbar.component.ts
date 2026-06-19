import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { QoButtonComponent } from '../primitives/button/button.component';

export interface QoTopbarTab {
  label: string;
  path: string;
}

export type QoDeployerTheme = 'dark' | 'light';

@Component({
  selector: 'qo-deployer-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, QoButtonComponent],
  templateUrl: './deployer-topbar.component.html',
  styleUrl: './deployer-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoDeployerTopbarComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tabs = input<readonly QoTopbarTab[]>([]);
  readonly unreadCount = input(0);
  readonly profileMenuOpen = input(false);
  readonly theme = input<QoDeployerTheme>('dark');
  readonly toggleNotifications = output<void>();
  readonly profileMenuToggleRequested = output<void>();
  readonly profileMenuCloseRequested = output<void>();
  readonly themeSelected = output<QoDeployerTheme>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (this.profileMenuOpen() && target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.profileMenuCloseRequested.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.profileMenuOpen()) {
      this.profileMenuCloseRequested.emit();
    }
  }

  selectTheme(theme: QoDeployerTheme): void {
    this.themeSelected.emit(theme);
    this.profileMenuCloseRequested.emit();
  }

  toggleTheme(): void {
    this.selectTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
