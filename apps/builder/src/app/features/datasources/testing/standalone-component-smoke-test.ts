import { Type } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { QueryRegistryService } from '@builder/core/services/query-registry.service';

const queryRegistryStub = {
  getQueryById: () => null,
  generateMockResult: () => ({ columns: [], rows: [] }),
  hasDuplicateName: () => false,
  saveQuery: () => undefined,
  deleteQueriesForDatasource: () => undefined,
  setQueryActive: () => undefined,
  deleteQuery: () => undefined,
};

export async function createStandaloneComponent(component: Type<unknown>): Promise<unknown> {
  await TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideHttpClient(),
      provideRouter([]),
      { provide: QueryRegistryService, useValue: queryRegistryStub },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  return fixture.componentInstance;
}
