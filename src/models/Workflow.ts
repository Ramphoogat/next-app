import mongoose, { Schema, Document, Model } from 'mongoose';

// Workflow Node Schema (matches React Flow Node structure)
const WorkflowNodeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, required: true },
    nodeType: { type: String, required: true },
    category: { type: String, enum: ['trigger', 'action', 'logic'], required: true },
    icon: { type: String, required: true },
    description: { type: String },
    config: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['idle', 'running', 'success', 'error'], default: 'idle' },
    lastRunAt: { type: Date },
    error: { type: String }
  },
  width: { type: Number },
  height: { type: Number },
  selected: { type: Boolean },
  dragging: { type: Boolean }
}, { _id: false });

// Workflow Edge Schema
const WorkflowEdgeSchema = new Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: { type: String },
  targetHandle: { type: String },
  type: { type: String },
  animated: { type: Boolean, default: true },
  style: { type: Schema.Types.Mixed }
}, { _id: false });

// Main Workflow Schema
export interface IWorkflowDocument extends Document {
  name: string;
  description?: string;
  nodes: typeof WorkflowNodeSchema[];
  edges: typeof WorkflowEdgeSchema[];
  status: 'draft' | 'active' | 'paused' | 'error';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  version: number;
  tags: string[];
}

const WorkflowSchema = new Schema<IWorkflowDocument>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  nodes: { type: [WorkflowNodeSchema], default: [] },
  edges: { type: [WorkflowEdgeSchema], default: [] },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'error'], 
    default: 'draft' 
  },
  createdBy: { type: String, required: true },
  lastRunAt: { type: Date },
  version: { type: Number, default: 1 },
  tags: { type: [String], default: [] }
}, {
  timestamps: true
});

// Indexes for better query performance
WorkflowSchema.index({ createdBy: 1, status: 1 });
WorkflowSchema.index({ name: 'text', description: 'text' });
WorkflowSchema.index({ tags: 1 });

// Delete existing model if it exists (for hot reloading)
const Workflow: Model<IWorkflowDocument> = 
  mongoose.models.Workflow || mongoose.model<IWorkflowDocument>('Workflow', WorkflowSchema);

export default Workflow;
