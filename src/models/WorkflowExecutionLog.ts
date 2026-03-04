import mongoose, { Schema, Document, Model } from 'mongoose';

// Node Execution Schema
const NodeExecutionSchema = new Schema({
  nodeId: { type: String, required: true },
  nodeName: { type: String, required: true },
  nodeType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'running', 'success', 'error', 'skipped'], 
    default: 'pending' 
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number },
  input: { type: Schema.Types.Mixed },
  output: { type: Schema.Types.Mixed },
  error: { type: String }
}, { _id: false });

// Workflow Execution Log Schema
export interface IWorkflowExecutionLogDocument extends Document {
  workflowId: mongoose.Types.ObjectId;
  workflowName: string;
  status: 'running' | 'success' | 'error';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  nodeExecutions: typeof NodeExecutionSchema[];
  triggeredBy: string;
  triggerType: 'manual' | 'webhook' | 'schedule' | 'api';
  error?: string;
  context?: Record<string, unknown>;
}

const WorkflowExecutionLogSchema = new Schema<IWorkflowExecutionLogDocument>({
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflowName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['running', 'success', 'error'], 
    default: 'running' 
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  duration: { type: Number },
  nodeExecutions: { type: [NodeExecutionSchema], default: [] },
  triggeredBy: { type: String, required: true },
  triggerType: { 
    type: String, 
    enum: ['manual', 'webhook', 'schedule', 'api'], 
    default: 'manual' 
  },
  error: { type: String },
  context: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes
WorkflowExecutionLogSchema.index({ workflowId: 1, startedAt: -1 });
WorkflowExecutionLogSchema.index({ status: 1 });
WorkflowExecutionLogSchema.index({ triggeredBy: 1 });

const WorkflowExecutionLog: Model<IWorkflowExecutionLogDocument> = 
  mongoose.models.WorkflowExecutionLog || 
  mongoose.model<IWorkflowExecutionLogDocument>('WorkflowExecutionLog', WorkflowExecutionLogSchema);

export default WorkflowExecutionLog;
