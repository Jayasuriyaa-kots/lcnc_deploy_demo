import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-builder-statusbar',
  standalone: true,
  templateUrl: './builder-statusbar.component.html',
  styleUrl: './builder-statusbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderStatusbarComponent {}

