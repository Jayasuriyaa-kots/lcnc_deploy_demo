import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

export interface Step {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
}

@Component({
  selector: 'qo-stepper',
  standalone: true,
  template: `
    <div class="qo-stepper">
      @for (step of steps(); track step.id; let i = $index) {
        <div 
          class="qo-stepper-item" 
          [class.qo-stepper-item-active]="i === activeStepIndex()"
          [class.qo-stepper-item-completed]="step.completed"
          (click)="onStepClick(i)">
          
          <div class="qo-stepper-indicator">
            <div class="qo-stepper-circle">
              @if (step.completed && i !== activeStepIndex()) {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              } @else {
                <span>{{ i + 1 }}</span>
              }
            </div>
          </div>
          
          <div class="qo-stepper-content">
            <h4 class="qo-stepper-label">{{ step.label }}</h4>
            @if (step.description) {
              <p class="qo-stepper-desc">{{ step.description }}</p>
            }
          </div>
          
        </div>
        
        @if (!$last) {
          <div class="qo-stepper-line" [class.qo-stepper-line-completed]="step.completed"></div>
        }
      }
    </div>
  `,
  styleUrl: './stepper.component.scss'
,
  changeDetection: ChangeDetectionStrategy.OnPush})
export class QoStepperComponent {
  steps = input<Step[]>([]);
  activeStepIndex = input<number>(0);
  
  stepClick = output<number>();

  onStepClick(index: number) {
    // Only allow clicking if it's a completed step or the active one
    const targetStep = this.steps()[index];
    if (targetStep.completed || index === this.activeStepIndex()) {
      this.stepClick.emit(index);
    }
  }
}

