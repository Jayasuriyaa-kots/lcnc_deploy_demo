import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { QoButtonComponent, QoSelectComponent, SelectOption } from '@qo/ui-components';
import {
  WorkflowMappingSource,
  WorkflowMappingSuggestion,
  WorkflowMappingTarget,
} from '../../../models/workflow-auto-mapping.model';
import {
  autoMapWorkflowTargets,
  normalizeWorkflowMapping,
  workflowSuggestionsToTemplateMapping,
} from '../../../models/workflow-auto-mapping.utils';
import { WORKFLOW_LANGUAGE } from '../../../services/workflow-language';

@Component({
  selector: 'app-workflow-field-mapper',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, TranslocoPipe, QoButtonComponent, QoSelectComponent],
  templateUrl: './workflow-field-mapper.component.html',
  styleUrl: './workflow-field-mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowFieldMapperComponent {
  readonly lang = WORKFLOW_LANGUAGE;
  readonly targets = input<readonly WorkflowMappingTarget[]>([]);
  readonly sources = input<readonly WorkflowMappingSource[]>([]);
  readonly value = input<unknown>({});
  readonly valueChange = output<Record<string, string>>();

  readonly mapping = computed(() => normalizeWorkflowMapping(this.value()));
  readonly suggestions = computed(() => autoMapWorkflowTargets(this.targets(), this.sources()));
  readonly sourceOptions = computed<SelectOption[]>(() =>
    this.sources().map((source) => ({
      label: `${source.label} - ${source.path}`,
      value: source.path,
    }))
  );
  readonly mappedCount = computed(() => Object.values(this.mapping()).filter(Boolean).length);
  readonly hasAutoSuggestions = computed(() => this.suggestions().length > 0);

  trackTarget(_: number, target: WorkflowMappingTarget): string {
    return target.key;
  }

  sourceValueForTarget(targetKey: string): string {
    return this.unwrapTemplate(this.mapping()[targetKey] ?? '');
  }

  suggestionForTarget(targetKey: string): WorkflowMappingSuggestion | null {
    return this.suggestions().find((suggestion) => suggestion.targetKey === targetKey) ?? null;
  }

  updateTarget(targetKey: string, sourcePath: string): void {
    const nextMapping = { ...this.mapping() };

    if (!sourcePath) {
      delete nextMapping[targetKey];
    } else {
      nextMapping[targetKey] = `{{${sourcePath}}}`;
    }

    this.valueChange.emit(nextMapping);
  }

  applyAutoMap(): void {
    const autoMapped = workflowSuggestionsToTemplateMapping(this.suggestions());
    this.valueChange.emit({
      ...this.mapping(),
      ...autoMapped,
    });
  }

  clearMapping(): void {
    this.valueChange.emit({});
  }

  private unwrapTemplate(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/^\{\{\s*(.*?)\s*\}\}$/);
    return match?.[1] ?? trimmed;
  }
}
