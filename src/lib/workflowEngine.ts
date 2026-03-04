/**
 * Workflow Execution Engine
 * Executes workflow nodes sequentially and handles data passing between nodes
 */

import { 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeData, 
  INodeExecution,
  WorkflowExecutionContext,
  HttpRequestConfig,
  SendEmailConfig,
  IfConditionConfig,
  DelayConfig,
  DatabaseWriteConfig,
  NotificationConfig
} from '@/types/workflow';

export interface ExecutionResult {
  success: boolean;
  nodeExecutions: INodeExecution[];
  error?: string;
  duration: number;
}

// Helper to get next nodes
function getNextNodes(
  currentNodeId: string, 
  edges: WorkflowEdge[], 
  nodes: WorkflowNode[],
  sourceHandle?: string
): WorkflowNode[] {
  const outgoingEdges = edges.filter(e => {
    if (e.source !== currentNodeId) return false;
    if (sourceHandle && e.sourceHandle !== sourceHandle) return false;
    return true;
  });
  
  return outgoingEdges
    .map(e => nodes.find(n => n.id === e.target))
    .filter((n): n is WorkflowNode => n !== undefined);
}

// Get trigger nodes (nodes with no incoming edges)
function getTriggerNodes(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const targetIds = new Set(edges.map(e => e.target));
  return nodes.filter(n => !targetIds.has(n.id) && n.data.category === 'trigger');
}

// Node Executors
async function executeHttpRequest(
  config: HttpRequestConfig,
  context: WorkflowExecutionContext
): Promise<Record<string, unknown>> {
  const { url, method = 'GET', headers, body, timeout = 30000 } = config;
  
  if (!url) {
    throw new Error('HTTP Request: URL is required');
  }

  // Replace variables in URL and body
  let processedUrl = url;
  let processedBody = body;
  
  for (const [key, value] of Object.entries(context.variables)) {
    const placeholder = `{{${key}}}`;
    processedUrl = processedUrl.replace(placeholder, String(value));
    if (processedBody) {
      processedBody = processedBody.replace(placeholder, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(processedUrl, {
      method,
      headers: headers ? JSON.parse(JSON.stringify(headers)) : undefined,
      body: method !== 'GET' && processedBody ? processedBody : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => ({}));

    return {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function executeSendEmail(
  config: SendEmailConfig,
  context: WorkflowExecutionContext
): Promise<Record<string, unknown>> {
  const { to, subject, body } = config;
  
  if (!to || !subject) {
    throw new Error('Send Email: recipient and subject are required');
  }

  // In a real implementation, this would call your email service
  // For now, we'll simulate the email sending
  console.log('Sending email:', { to, subject, body });
  
  return {
    sent: true,
    to,
    subject,
    timestamp: new Date().toISOString(),
  };
}

async function executeDatabaseWrite(
  config: DatabaseWriteConfig,
  context: WorkflowExecutionContext
): Promise<Record<string, unknown>> {
  const { collection, operation, query, data } = config;
  
  if (!collection || !operation) {
    throw new Error('Database Write: collection and operation are required');
  }

  // In a real implementation, this would interact with the database
  console.log('Database operation:', { collection, operation, query, data });
  
  return {
    success: true,
    collection,
    operation,
    timestamp: new Date().toISOString(),
  };
}

async function executeNotification(
  config: NotificationConfig,
  context: WorkflowExecutionContext
): Promise<Record<string, unknown>> {
  const { channel, message, recipient } = config;
  
  if (!channel || !message) {
    throw new Error('Notification: channel and message are required');
  }

  console.log('Sending notification:', { channel, message, recipient });
  
  return {
    sent: true,
    channel,
    recipient,
    timestamp: new Date().toISOString(),
  };
}

function evaluateCondition(
  config: IfConditionConfig,
  context: WorkflowExecutionContext
): boolean {
  const { field, operator, value } = config;
  
  if (!field || !operator) {
    return false;
  }

  // Get the field value from context
  const fieldValue = field.split('.').reduce<unknown>((obj, key) => {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, context.variables);

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not-equals':
      return fieldValue !== value;
    case 'contains':
      return String(fieldValue).includes(value || '');
    case 'greater-than':
      return Number(fieldValue) > Number(value);
    case 'less-than':
      return Number(fieldValue) < Number(value);
    case 'is-empty':
      return !fieldValue || fieldValue === '';
    case 'is-not-empty':
      return !!fieldValue && fieldValue !== '';
    default:
      return false;
  }
}

async function executeDelay(config: DelayConfig): Promise<void> {
  const { duration = 0, unit = 'seconds' } = config;
  
  const multipliers: Record<string, number> = {
    seconds: 1000,
    minutes: 60000,
    hours: 3600000,
    days: 86400000,
  };

  const ms = duration * (multipliers[unit] || 1000);
  await new Promise(resolve => setTimeout(resolve, Math.min(ms, 300000))); // Max 5 minutes
}

// Execute a single node
async function executeNode(
  node: WorkflowNode,
  context: WorkflowExecutionContext
): Promise<{ output: Record<string, unknown>; nextHandle?: string }> {
  const { nodeType, config } = node.data;

  switch (nodeType) {
    // Triggers - just pass through
    case 'webhook':
    case 'schedule':
    case 'form-submission':
    case 'api-event':
      return { output: context.variables };

    // Actions
    case 'http-request':
      return { output: await executeHttpRequest(config as HttpRequestConfig, context) };
    
    case 'send-email':
      return { output: await executeSendEmail(config as SendEmailConfig, context) };
    
    case 'database-write':
      return { output: await executeDatabaseWrite(config as DatabaseWriteConfig, context) };
    
    case 'notification':
      return { output: await executeNotification(config as NotificationConfig, context) };

    // Logic
    case 'if-condition': {
      const result = evaluateCondition(config as IfConditionConfig, context);
      return { 
        output: { conditionResult: result },
        nextHandle: result ? 'true' : 'false'
      };
    }

    case 'delay':
      await executeDelay(config as DelayConfig);
      return { output: { delayed: true } };

    case 'switch':
    case 'loop':
      // Simplified implementation
      return { output: {} };

    default:
      return { output: {} };
  }
}

// Main execution function
export async function executeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  triggerData: Record<string, unknown> = {},
  executionId: string
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const nodeExecutions: INodeExecution[] = [];
  
  const context: WorkflowExecutionContext = {
    workflowId: '',
    executionId,
    variables: { ...triggerData },
    nodeOutputs: {},
  };

  // Initialize all node executions as pending
  nodes.forEach(node => {
    nodeExecutions.push({
      nodeId: node.id,
      nodeName: node.data.label,
      nodeType: node.data.nodeType,
      status: 'pending',
    });
  });

  try {
    // Find trigger nodes
    const triggerNodes = getTriggerNodes(nodes, edges);
    
    if (triggerNodes.length === 0) {
      throw new Error('No trigger node found in workflow');
    }

    // Queue for BFS execution
    const queue: { node: WorkflowNode; sourceHandle?: string }[] = 
      triggerNodes.map(n => ({ node: n }));
    const executed = new Set<string>();

    while (queue.length > 0) {
      const { node, sourceHandle } = queue.shift()!;
      
      if (executed.has(node.id)) continue;
      executed.add(node.id);

      // Find and update node execution record
      const execIndex = nodeExecutions.findIndex(e => e.nodeId === node.id);
      if (execIndex === -1) continue;

      const nodeExec = nodeExecutions[execIndex];
      nodeExec.status = 'running';
      nodeExec.startedAt = new Date();
      nodeExec.input = { ...context.variables };

      try {
        // Execute the node
        const { output, nextHandle } = await executeNode(node, context);
        
        // Store output
        context.nodeOutputs[node.id] = output;
        context.variables = { ...context.variables, ...output };

        // Update execution record
        nodeExec.status = 'success';
        nodeExec.completedAt = new Date();
        nodeExec.duration = nodeExec.completedAt.getTime() - nodeExec.startedAt.getTime();
        nodeExec.output = output;

        // Queue next nodes
        const nextNodes = getNextNodes(node.id, edges, nodes, nextHandle);
        nextNodes.forEach(n => queue.push({ node: n }));

      } catch (error) {
        nodeExec.status = 'error';
        nodeExec.completedAt = new Date();
        nodeExec.duration = nodeExec.completedAt.getTime() - (nodeExec.startedAt?.getTime() || 0);
        nodeExec.error = error instanceof Error ? error.message : 'Unknown error';
        
        throw error;
      }
    }

    // Mark any unexecuted nodes as skipped
    nodeExecutions.forEach(exec => {
      if (exec.status === 'pending') {
        exec.status = 'skipped';
      }
    });

    return {
      success: true,
      nodeExecutions,
      duration: Date.now() - startTime,
    };

  } catch (error) {
    return {
      success: false,
      nodeExecutions,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

export default executeWorkflow;
