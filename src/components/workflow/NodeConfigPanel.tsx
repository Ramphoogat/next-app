"use client";

import React from 'react';
import {
  X, Settings, Webhook, Clock, FileText, Zap, Mail, Globe,
  Database, Bell, GitBranch, Timer, Split, Repeat, Trash2, Link2
} from 'lucide-react';
import { WorkflowNode, NodeConfig } from '@/types/workflow';

// Icon mapping
const IconMap: Record<string, React.ElementType> = {
  Webhook, Clock, FileText, Zap, Mail, Globe, Database, Bell,
  GitBranch, Timer, Split, Repeat, Link2
};

interface NodeConfigPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

// Input component for consistent styling
interface ConfigInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email';
}

const ConfigInput: React.FC<ConfigInputProps> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full px-3 py-2.5 rounded-xl text-sm
        bg-gray-50 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
        transition-all
      "
    />
  </div>
);

// Select component
interface ConfigSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const ConfigSelect: React.FC<ConfigSelectProps> = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full px-3 py-2.5 rounded-xl text-sm
        bg-gray-50 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
        transition-all
      "
    >
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Textarea component
interface ConfigTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const ConfigTextarea: React.FC<ConfigTextareaProps> = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full px-3 py-2.5 rounded-xl text-sm
        bg-gray-50 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
        transition-all resize-none
      "
    />
  </div>
);

// Node-specific configuration panels
const WebhookConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="Webhook URL"
      value={(config as { url?: string }).url || ''}
      onChange={(url) => onUpdate({ ...config, url })}
      placeholder="Will be auto-generated"
    />
    <ConfigSelect
      label="HTTP Method"
      value={(config as { method?: string }).method || 'POST'}
      onChange={(method) => onUpdate({ ...config, method: method as 'GET' | 'POST' | 'PUT' | 'DELETE' })}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ]}
    />
  </div>
);

const ScheduleConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="Cron Expression"
      value={(config as { cron?: string }).cron || ''}
      onChange={(cron) => onUpdate({ ...config, cron })}
      placeholder="*/5 * * * *"
    />
    <ConfigSelect
      label="Timezone"
      value={(config as { timezone?: string }).timezone || 'UTC'}
      onChange={(timezone) => onUpdate({ ...config, timezone })}
      options={[
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
      ]}
    />
  </div>
);

const HttpRequestConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="URL"
      value={(config as { url?: string }).url || ''}
      onChange={(url) => onUpdate({ ...config, url })}
      placeholder="https://api.example.com/endpoint"
    />
    <ConfigSelect
      label="Method"
      value={(config as { method?: string }).method || 'GET'}
      onChange={(method) => onUpdate({ ...config, method })}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
      ]}
    />
    <ConfigTextarea
      label="Headers (JSON)"
      value={(config as { headers?: string }).headers || ''}
      onChange={(headers) => onUpdate({ ...config, headers })}
      placeholder='{"Content-Type": "application/json"}'
      rows={3}
    />
    <ConfigTextarea
      label="Body"
      value={(config as { body?: string }).body || ''}
      onChange={(body) => onUpdate({ ...config, body })}
      placeholder='{"key": "value"}'
    />
  </div>
);

const SendEmailConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="To"
      value={(config as { to?: string }).to || ''}
      onChange={(to) => onUpdate({ ...config, to })}
      placeholder="recipient@example.com"
      type="email"
    />
    <ConfigInput
      label="Subject"
      value={(config as { subject?: string }).subject || ''}
      onChange={(subject) => onUpdate({ ...config, subject })}
      placeholder="Email subject"
    />
    <ConfigTextarea
      label="Body"
      value={(config as { body?: string }).body || ''}
      onChange={(body) => onUpdate({ ...config, body })}
      placeholder="Email body content..."
    />
  </div>
);

const IfConditionConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="Field"
      value={(config as { field?: string }).field || ''}
      onChange={(field) => onUpdate({ ...config, field })}
      placeholder="data.status"
    />
    <ConfigSelect
      label="Operator"
      value={(config as { operator?: string }).operator || 'equals'}
      onChange={(operator) => onUpdate({ ...config, operator })}
      options={[
        { value: 'equals', label: 'Equals' },
        { value: 'not-equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'greater-than', label: 'Greater Than' },
        { value: 'less-than', label: 'Less Than' },
        { value: 'is-empty', label: 'Is Empty' },
        { value: 'is-not-empty', label: 'Is Not Empty' },
      ]}
    />
    <ConfigInput
      label="Value"
      value={(config as { value?: string }).value || ''}
      onChange={(value) => onUpdate({ ...config, value })}
      placeholder="Expected value"
    />
  </div>
);

const DelayConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="Duration"
      value={String((config as { duration?: number }).duration || '')}
      onChange={(duration) => onUpdate({ ...config, duration: parseInt(duration) || 0 })}
      placeholder="5"
      type="number"
    />
    <ConfigSelect
      label="Unit"
      value={(config as { unit?: string }).unit || 'seconds'}
      onChange={(unit) => onUpdate({ ...config, unit })}
      options={[
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
      ]}
    />
  </div>
);

const DatabaseWriteConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigInput
      label="Collection"
      value={(config as { collection?: string }).collection || ''}
      onChange={(collection) => onUpdate({ ...config, collection })}
      placeholder="users"
    />
    <ConfigSelect
      label="Operation"
      value={(config as { operation?: string }).operation || 'insert'}
      onChange={(operation) => onUpdate({ ...config, operation })}
      options={[
        { value: 'insert', label: 'Insert' },
        { value: 'update', label: 'Update' },
        { value: 'upsert', label: 'Upsert' },
        { value: 'delete', label: 'Delete' },
      ]}
    />
    <ConfigTextarea
      label="Query (JSON)"
      value={(config as { query?: string }).query || ''}
      onChange={(query) => onUpdate({ ...config, query })}
      placeholder='{"_id": "..."}'
      rows={3}
    />
    <ConfigTextarea
      label="Data (JSON)"
      value={(config as { data?: string }).data || ''}
      onChange={(data) => onUpdate({ ...config, data })}
      placeholder='{"field": "value"}'
    />
  </div>
);

const NotificationConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigSelect
      label="Channel"
      value={(config as { channel?: string }).channel || 'email'}
      onChange={(channel) => onUpdate({ ...config, channel })}
      options={[
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push Notification' },
        { value: 'slack', label: 'Slack' },
      ]}
    />
    <ConfigInput
      label="Recipient"
      value={(config as { recipient?: string }).recipient || ''}
      onChange={(recipient) => onUpdate({ ...config, recipient })}
      placeholder="user@example.com or @channel"
    />
    <ConfigTextarea
      label="Message"
      value={(config as { message?: string }).message || ''}
      onChange={(message) => onUpdate({ ...config, message })}
      placeholder="Notification message..."
    />
  </div>
);

// Config for the Node Connector
const NodeConnectorConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
      <div className="flex items-start gap-3">
        <Link2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Node Connector</p>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
            This node bridges two or more triggers or nodes together. Connect any output handle to this
            node&rsquo;s input, then connect this node&rsquo;s output to the next step.
          </p>
        </div>
      </div>
    </div>
    <ConfigInput
      label="Label"
      value={(config as { label?: string }).label || ''}
      onChange={(label) => onUpdate({ ...config, label })}
      placeholder="e.g. Merge Triggers"
    />
    <ConfigTextarea
      label="Notes"
      value={(config as { notes?: string }).notes || ''}
      onChange={(notes) => onUpdate({ ...config, notes })}
      placeholder="Describe what this connector does..."
      rows={3}
    />
  </div>
);

// Generic config for nodes without specific panel
const GenericConfig: React.FC<{ config: NodeConfig; onUpdate: (config: NodeConfig) => void }> = ({ config, onUpdate }) => (
  <div className="space-y-4">
    <ConfigTextarea
      label="Configuration (JSON)"
      value={JSON.stringify(config, null, 2)}
      onChange={(value) => {
        try {
          onUpdate(JSON.parse(value));
        } catch {
          // Invalid JSON, ignore
        }
      }}
      placeholder='{"key": "value"}'
      rows={6}
    />
  </div>
);

// Renders the correct config form for a given node type.
// Implemented as a plain function returning JSX (NOT a component) to
// avoid React's "components created during render" error.
const renderConfig = (
  nodeType: string,
  config: NodeConfig,
  onUpdate: (config: NodeConfig) => void
): React.ReactNode => {
  const props = { config, onUpdate };
  switch (nodeType) {
    case 'webhook': return <WebhookConfig {...props} />;
    case 'schedule': return <ScheduleConfig {...props} />;
    case 'node-connector': return <NodeConnectorConfig {...props} />;
    case 'send-email': return <SendEmailConfig {...props} />;
    case 'http-request': return <HttpRequestConfig {...props} />;
    case 'database-write': return <DatabaseWriteConfig {...props} />;
    case 'notification': return <NotificationConfig {...props} />;
    case 'if-condition': return <IfConditionConfig {...props} />;
    case 'delay': return <DelayConfig {...props} />;
    default: return <GenericConfig {...props} />;
  }
};

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose
}) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Settings className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a node to configure
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = IconMap[selectedNode.data.icon];

  const handleConfigUpdate = (newConfig: NodeConfig) => {
    onUpdateNode(selectedNode.id, { config: newConfig });
  };

  const categoryColors = {
    trigger: 'from-emerald-500 to-emerald-600',
    action: 'from-blue-500 to-blue-600',
    logic: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className={`bg-gradient-to-r ${categoryColors[selectedNode.data.category]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              {Icon && <Icon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{selectedNode.data.label}</h3>
              <p className="text-xs text-white/70 capitalize">{selectedNode.data.category} Node</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Node name edit */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <ConfigInput
          label="Node Name"
          value={selectedNode.data.label}
          onChange={(label) => onUpdateNode(selectedNode.id, { label })}
          placeholder="Node name"
        />
      </div>

      {/* Configuration */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Configuration
        </h4>
        {renderConfig(
          selectedNode.data.nodeType,
          selectedNode.data.config,
          handleConfigUpdate
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="
            w-full flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-xl
            bg-red-50 dark:bg-red-500/10
            text-red-600 dark:text-red-400
            hover:bg-red-100 dark:hover:bg-red-500/20
            transition-colors text-sm font-medium
          "
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
