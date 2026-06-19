import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fromEvent, map, startWith } from 'rxjs';
import {
  QueryReferenceRecord,
  QueryRegistryService,
} from '@builder/core/services/query-registry.service';
import {
  DatasourceAuthMode,
  DatasourceConfigFormValue,
  DatasourceConfigRuntimeTab,
  DatasourceConnectorId,
  DatasourceConnectorOption,
  DatasourceEditorTab,
  DatasourceFieldMapping,
  DatasourceFieldType,
  DatasourceHostEntry,
  DatasourceKeyValueEntry,
  DatasourceQueryRecord,
  DatasourceQueryResultTab,
  DatasourceSection,
  DatasourceSourceRecord,
  DatasourceWorkspace,
  DatasourceResultRow,
} from '@builder/features/datasources/models/datasource-dashboard.model';
import {
  ExternalApiConfigurationValue,
  ExternalApiFieldSchema,
  ExternalApiMappingValue,
  ExternalApiSchema,
} from '@builder/features/datasources/models/external-api-schemas';

import {
  DatasourceEditorForm,
  DatasourceSaveQueryForm,
  ExternalApiDynamicForm,
  ExternalApiMappingGroup,
  HostGroup,
  KeyValueGroup,
  SchemaFieldGroup,
} from '@builder/features/datasources/models/datasource-form-groups.types';

import { DatasourcesManagementService } from '@builder/features/datasources/services/datasources-management.service';

export abstract class DatasourcesQueryService extends DatasourcesManagementService {
  protected abstract seedEditor(sourceId: string, queryId: string | null): void;
  protected abstract persistActiveEditorTab(): void;
  protected abstract patchEditorFromTab(tab: DatasourceEditorTab): void;

  openEditor(sourceId: string, queryId: string | null = null): void {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('queryDetail.openEditor'));
      return;
    }

    if (!source.active) {
      this.notifyError(
        this.i18n.translate('common.datasourceInactiveActivateBeforeEditingQuery', { name: source.name }),
        this.i18n.translate('queryDetail.openEditor')
      );
      return;
    }

    const existingQuery = queryId ? source.queries.find((query) => query.id === queryId) : null;
    if (existingQuery && !existingQuery.active) {
      this.notifyError(
        this.i18n.translate('editor.queryInactiveActivateBeforeEditing', { name: existingQuery.name }),
        this.i18n.translate('queryDetail.openEditor')
      );
      return;
    }

    this.selectedSourceId.set(sourceId);
    this.seedEditor(sourceId, queryId);
    this.workspace.set('editor');
  }

  closeEditor(): void {
    this.persistActiveEditorTab();
    this.backToDashboard();
  }

  addEditorTab(): void {
    const sourceId = this.editorForm.controls.datasourceId.value || this.selectedSourceId() || this.sources()[0]?.id || '';
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source?.active) {
      this.notifyError(
        this.i18n.translate('common.activateDatasourceBeforeAddingQuery'),
        this.i18n.translate('editor.addQuery')
      );
      return;
    }

    const nextIndex = this.queryTabs().length + 1;
    const nextTab: DatasourceEditorTab = {
      id: `draft-${Date.now()}`,
      datasourceId: sourceId,
      name: `Query ${nextIndex}`,
      queryTypeLabel: this.i18n.translate('configSections.customQuery'),
      query: 'SELECT * FROM users LIMIT 10;',
      existingQueryId: null,
    };
    this.persistActiveEditorTab();
    this.queryTabs.update((tabs) => [...tabs, nextTab]);
    this.activeQueryTabId.set(nextTab.id);
    this.patchEditorFromTab(nextTab);
    this.hasRunQuery.set(false);
    this.currentResultColumns.set([]);
    this.currentResultRows.set([]);
    this.executedQueryText.set('');
  }

  switchEditorTab(tabId: string): void {
    this.persistActiveEditorTab();
    const tab = this.queryTabs().find((item) => item.id === tabId);
    if (!tab) {
      return;
    }
    this.activeQueryTabId.set(tabId);
    this.patchEditorFromTab(tab);
    this.hasRunQuery.set(false);
    this.currentResultColumns.set([]);
    this.currentResultRows.set([]);
    this.executedQueryText.set('');
  }

  changeEditorDatasource(sourceId: string): void {
    this.editorForm.controls.datasourceId.setValue(sourceId);
    this.selectedSourceId.set(sourceId);
    this.hasRunQuery.set(false);
    this.currentResultColumns.set([]);
    this.currentResultRows.set([]);
    this.executedQueryText.set('');
  }

  runQuery(): void {
    if (!this.canRunActiveQuery()) {
      this.notifyError(
        this.i18n.translate('editor.activateDatasourceAndQueryBeforeRunningIt'),
        this.i18n.translate('editor.runQuery')
      );
      return;
    }

    const queryText = this.editorForm.controls.query.value;
    const mockResult = this.queryRegistry.generateMockResult(queryText);

    this.runningQuery.set(true);
    this.currentResultColumns.set([]);
    this.currentResultRows.set([]);
    queueMicrotask(() => {
      this.runningQuery.set(false);
      this.executedQueryText.set(queryText);
      this.currentResultColumns.set(mockResult.columns);
      this.currentResultRows.set(mockResult.rows);
      this.hasRunQuery.set(true);
      this.resultTab.set('Results');
      this.lastRunAtLabel.set(`Run completed at ${new Date().toLocaleTimeString()}`);
      this.notifySuccess(this.i18n.translate('editor.queryRanSuccessfully'), this.i18n.translate('editor.runQuery'));
    });
  }

  setResultTab(tab: DatasourceQueryResultTab): void {
    this.resultTab.set(tab);
  }

  openSaveQueryModal(): void {
    const active = this.activeEditorTab();
    this.saveQueryForm.reset({
      name: active?.name ?? this.i18n.translate('uiText.query1'),
      description: '',
    });
    this.saveQueryModalOpen.set(true);
  }

  closeSaveQueryModal(): void {
    this.saveQueryModalOpen.set(false);
  }

  saveQuery(): void {
    this.saveQueryForm.markAllAsTouched();
    if (this.saveQueryForm.invalid) {
      return;
    }

    const sourceId = this.editorForm.controls.datasourceId.value || this.selectedSourceId();
    if (!sourceId) {
      return;
    }

    const source = this.sources().find((item) => item.id === sourceId);
    if (!source?.active) {
      this.notifyError(
        this.i18n.translate('editor.activateDatasourceBeforeSavingQuery'),
        this.i18n.translate('editor.saveQuery')
      );
      return;
    }

    const nextName = this.saveQueryForm.controls.name.value.trim();
    const activeTab = this.activeEditorTab();
    const existingQueryId = activeTab?.existingQueryId ?? null;
    if (this.queryRegistry.hasDuplicateName(sourceId, nextName, existingQueryId ?? undefined)) {
      this.notifyError(
        this.i18n.translate('editor.duplicateQueryNameError'),
        this.i18n.translate('editor.saveQuery')
      );
      return;
    }

    const queryText = this.editorForm.controls.query.value;
    const mockResult = this.queryRegistry.generateMockResult(queryText);
    const queryId = `query-${Date.now()}`;
    const nextQuery: DatasourceQueryRecord = {
      id: existingQueryId ?? queryId,
      name: nextName,
      method: 'SELECT',
      query: queryText,
      active: true,
      calls: '920',
      p50: '35ms',
      p95: '140ms',
      errorRate: '0.0%',
      retries: '0',
      authHealthy: true,
      accessCount: '88',
    };

    this.sources.update((sources) =>
      sources.map((source) => {
        if (source.id !== sourceId) {
          return source;
        }

        const existingIndex = source.queries.findIndex((query) => query.id === nextQuery.id);
        const nextQueries = existingIndex >= 0
          ? source.queries.map((query) => (query.id === nextQuery.id ? nextQuery : query))
          : [nextQuery, ...source.queries];

        return { ...source, expanded: true, queries: nextQueries };
      })
    );

    this.queryRegistry.saveQuery({
      id: nextQuery.id,
      name: nextQuery.name,
      datasourceId: source.id,
      datasourceName: source.name,
      queryType: this.editorForm.controls.queryTypeLabel.value || 'SQL',
      query: queryText,
      columns: mockResult.columns,
      mockData: mockResult.rows,
      active: nextQuery.active,
      usedIn: this.queryRegistry.getQueryById(nextQuery.id)?.usedIn ?? [],
    });

    this.closeSaveQueryModal();
    this.backToDashboard();
    this.notifySuccess(this.i18n.translate('editor.querySavedSuccessfully'), this.i18n.translate('editor.saveQuery'));
  }

  deleteSource(sourceId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('externalApis.delete'));
      return;
    }

    this.sources.update((sources) => sources.filter((item) => item.id !== sourceId));
    this.queryRegistry.deleteQueriesForDatasource(sourceId);
    this.querySearchByDatasourceId.update((current) => {
      const nextSearch = { ...current };
      delete nextSearch[sourceId];
      return nextSearch;
    });

    if (this.selectedSourceId() === sourceId) {
      this.selectedSourceId.set(null);
      this.backToDashboard();
    }
    if (this.schemaSourceId() === sourceId) {
      this.closeSchema();
    }
    if (this.detailState()?.source.id === sourceId) {
      this.closeDetail();
    }

    this.notifySuccess(
      this.i18n.translate('common.datasourceDeletedSuccessfully', { name: source.name }),
      this.i18n.translate('externalApis.delete')
    );
  }

  toggleSourceActive(sourceId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('externalApis.metricStatus'));
      return;
    }

    const nextActive = !source.active;
    this.sources.update((sources) =>
      sources.map((item) =>
        item.id === sourceId
          ? { ...item, active: nextActive }
          : item
      )
    );

    if (!nextActive && this.selectedSourceId() === sourceId) {
      this.backToDashboard();
    }

    this.notifySuccess(
      this.i18n.translate(nextActive ? 'common.markedActive' : 'common.markedInactive', { name: source.name }),
      this.i18n.translate('externalApis.metricStatus')
    );
  }

  toggleQueryActive(sourceId: string, queryId: string): void {
    let queryName = '';
    let nextActive = false;
    let foundQuery = false;

    this.sources.update((sources) =>
      sources.map((source) => {
        if (source.id !== sourceId) {
          return source;
        }

        return {
          ...source,
          queries: source.queries.map((query) => {
            if (query.id !== queryId) {
              return query;
            }

            foundQuery = true;
            queryName = query.name;
            nextActive = !query.active;
            return { ...query, active: nextActive };
          }),
        };
      })
    );

    if (!foundQuery) {
      this.notifyError(this.i18n.translate('editor.queryNotFound'), this.i18n.translate('externalApis.metricStatus'));
      return;
    }

    this.queryRegistry.setQueryActive(queryId, nextActive);
    this.notifySuccess(
      this.i18n.translate(nextActive ? 'common.markedActive' : 'common.markedInactive', { name: queryName }),
      this.i18n.translate('externalApis.metricStatus')
    );
  }

  deleteQuery(sourceId: string, queryId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    const query = source?.queries.find((item) => item.id === queryId);
    if (!source || !query) {
      this.notifyError(this.i18n.translate('editor.queryNotFound'), this.i18n.translate('externalApis.delete'));
      return;
    }

    this.sources.update((sources) =>
      sources.map((source) =>
        source.id === sourceId
          ? { ...source, queries: source.queries.filter((query) => query.id !== queryId) }
          : source
      )
    );
    this.queryRegistry.deleteQuery(queryId);
    this.notifySuccess(
      this.i18n.translate('editor.queryDeletedSuccessfully', { name: query.name }),
      this.i18n.translate('externalApis.delete')
    );
  }

}
