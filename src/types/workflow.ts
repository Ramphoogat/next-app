//workflow types and interfaces

import { Node, Edge } from '@xyflow/react';

// Node Categories
export type NodeCategory = 'trigger' | 'action' | 'logic';

// Node Types within each category
export type TriggerNodeType = 'webhook' | 'schedule' | 'form-submission' | 'api-event' | 'node-connector';
export type ActionNodeType = 'send-email' | 'http-request' | 'database-write' | 'notification';
export type LogicNodeType = 'if-condition' | 'delay' | 'switch' | 'loop';

export type WorkflowNodeType = TriggerNodeType | ActionNodeType | LogicNodeType;

// Node Configuration Types
export interface WebhookConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string> | string;
}

export interface ScheduleConfig {
  cron?: string;
  timezone?: string;
  runOnce?: boolean;
  startDate?: string;
}

export interface FormSubmissionConfig {
  formId?: string;
  fields?: string[];
}

export interface ApiEventConfig {
  eventType?: string;
  apiEndpoint?: string;
}

export interface SendEmailConfig {
  to?: string;
  subject?: string;
  body?: string;
  html?: boolean;
}

export interface HttpRequestConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string> | string;
  body?: string;
  timeout?: number;
}

export interface DatabaseWriteConfig {
  collection?: string;
  operation?: string;
  query?: string;
  data?: string;
}

export interface NotificationConfig {
  channel?: string;
  message?: string;
  recipient?: string;
}

export interface IfConditionConfig {
  field?: string;
  operator?: string;
  value?: string;
}

export interface DelayConfig {
  duration?: number;
  unit?: string;
}

export interface SwitchConfig {
  field?: string;
  cases?: { value: string; label: string }[];
}

export interface LoopConfig {
  iterateOver?: string;
  maxIterations?: number;
}

export interface NodeConnectorConfig {
  label?: string;
  notes?: string;
}

export type NodeConfig =
  | WebhookConfig
  | ScheduleConfig
  | FormSubmissionConfig
  | ApiEventConfig
  | NodeConnectorConfig
  | SendEmailConfig
  | HttpRequestConfig
  | DatabaseWriteConfig
  | NotificationConfig
  | IfConditionConfig
  | DelayConfig
  | SwitchConfig
  | LoopConfig
  | Record<string, unknown>;

// Workflow Node Data
export interface WorkflowNodeData {
  [key: string]: unknown;
  label: string;
  nodeType: WorkflowNodeType | string;
  category: NodeCategory;
  icon: string;
  description?: string;
  config: NodeConfig;
  status?: 'idle' | 'running' | 'success' | 'error';
  lastRunAt?: Date;
  error?: string;
}

// Custom Node type for React Flow
export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

// Node Library Item
export interface NodeLibraryItem {
  type: WorkflowNodeType | string;
  category: NodeCategory;
  label: string;
  icon: string;
  description: string;
}

// Workflow Status
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error';

// Workflow Model
export interface IWorkflow {
  _id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  version?: number;
  tags?: string[];
}

// Workflow Execution Log
export interface IWorkflowExecutionLog {
  _id?: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  nodeExecutions: INodeExecution[];
  triggeredBy: string;
  error?: string;
}

export interface INodeExecution {
  nodeId: string;
  nodeName: string;
  nodeType: WorkflowNodeType | string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

// API Response Types
export interface WorkflowApiResponse {
  success: boolean;
  data?: IWorkflow | IWorkflow[];
  error?: string;
  message?: string;
}

export interface ExecutionApiResponse {
  success: boolean;
  data?: IWorkflowExecutionLog | IWorkflowExecutionLog[];
  error?: string;
  message?: string;
}

// Workflow Context for execution
export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  nodeOutputs: Record<string, unknown>;
}