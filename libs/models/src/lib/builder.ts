export interface DataSource {
  id: string;
  name: string;
  type: 'postgres' | 'mysql' | 'rest' | 'graphql' | 'stripe';
  status: 'connected' | 'error' | 'pending';
  appId: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastPingMs?: number;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
  name: string;
  label: string;
  required: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface Form {
  id: string;
  name: string;
  slug: string;
  appId: string;
  description?: string;
  fields: FormField[];
  submitDataSourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageLayoutNode {
  id: string;
  type: 'row' | 'col' | 'text' | 'form' | 'table' | 'button' | 'metric';
  props?: Record<string, any>;
  children?: PageLayoutNode[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  appId: string;
  layout: PageLayoutNode;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'query' | 'condition' | 'action' | 'response';
  name: string;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  appId: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  appId: string;
  description: string;
  permissions: string[];
}

export interface BuilderContext {
  organisationId: string;
  applicationId: string;
  applicationName: string;
}
