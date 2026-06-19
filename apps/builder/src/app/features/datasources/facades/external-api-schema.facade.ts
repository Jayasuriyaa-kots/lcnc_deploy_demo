import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import {
  ExternalApiConnectorSchema,
  ExternalApiSchema,
  ExternalApiSchemaDocument,
} from '@builder/features/datasources/models/external-api-schemas';

/** Scoped facade for the External API schema cache and loading state. */
@Injectable({ providedIn: 'root' })
export class ExternalApiSchemaFacade {
  private readonly http = inject(HttpClient);
  private readonly documentState = signal<ExternalApiSchemaDocument | null>(null);
  private readonly loadingState = signal(false);
  private readonly schemaAssetCandidates = [
    '/assets/external-api-schemas.json',
    'assets/external-api-schemas.json',
    '/browser/assets/external-api-schemas.json',
  ] as const;

  readonly document = computed(() => this.documentState());
  readonly loading = computed(() => this.loadingState());
  readonly connectors = computed(() => this.documentState()?.connectors ?? []);

  load(): void {
    if (this.loadingState() || this.documentState()) {
      return;
    }

    this.loadingState.set(true);
    this.loadSchemaFromCandidates().subscribe({
      next: (document) => {
        this.documentState.set(document);
        this.loadingState.set(false);
      },
      error: () => {
        this.documentState.set({ connectors: [] });
        this.loadingState.set(false);
      },
    });
  }

  private loadSchemaFromCandidates(index = 0): Observable<ExternalApiSchemaDocument> {
    const url = this.schemaAssetCandidates[index];
    if (!url) {
      return throwError(() => new Error('External API schema asset not found.'));
    }

    return this.http.get<ExternalApiSchemaDocument>(url).pipe(
      catchError(() => this.loadSchemaFromCandidates(index + 1))
    );
  }

  connector(connectorKey: string): ExternalApiConnectorSchema | null {
    return this.connectors().find((connector) => connector.key === connectorKey) ?? null;
  }

  schema(connectorKey: string): ExternalApiSchema | null {
    return this.connector(connectorKey)?.schema ?? null;
  }
}
