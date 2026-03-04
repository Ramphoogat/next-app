"use client";

import React, { useState } from 'react';
import {
  Webhook,
  Clock,
  FileText,
  Zap,
  Mail,
  Globe,
  Database,
  Bell,
  GitBranch,
  Timer,
  Split,
  Repeat,
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
} from 'lucide-react';
import { NodeLibraryItem, NodeCategory } from '@/types/workflow';

// ── Node Library Data ──────────────────────────────────────────────────────
export const NODE_LIBRARY: NodeLibraryItem[] = [
  // Triggers
  { type: 'webhook', category: 'trigger', label: 'Webhook', icon: 'Webhook', description: 'Trigger on HTTP request' },
  { type: 'schedule', category: 'trigger', label: 'Schedule', icon: 'Clock', description: 'Run on a schedule' },
  { type: 'form-submission', category: 'trigger', label: 'Form Submission', icon: 'FileText', description: 'Trigger on form submit' },
  { type: 'api-event', category: 'trigger', label: 'API Event', icon: 'Zap', description: 'Listen to API events' },
  // Actions
  { type: 'send-email', category: 'action', label: 'Send Email', icon: 'Mail', description: 'Send an email message' },
  { type: 'http-request', category: 'action', label: 'HTTP Request', icon: 'Globe', description: 'Make HTTP API calls' },
  { type: 'database-write', category: 'action', label: 'Database Write', icon: 'Database', description: 'Write to database' },
  { type: 'notification', category: 'action', label: 'Notification', icon: 'Bell', description: 'Send notifications' },
  // Logic
  { type: 'if-condition', category: 'logic', label: 'IF Condition', icon: 'GitBranch', description: 'Conditional branching' },
  { type: 'delay', category: 'logic', label: 'Delay', icon: 'Timer', description: 'Wait for duration' },
  { type: 'switch', category: 'logic', label: 'Switch', icon: 'Split', description: 'Multi-way branching' },
  { type: 'loop', category: 'logic', label: 'Loop', icon: 'Repeat', description: 'Iterate over items' },
];

// ── Icon Map ──────────────────────────────────────────────────────────────
export const IconMap: Record<string, React.ElementType> = {
  Webhook, Clock, FileText, Zap, Mail, Globe, Database, Bell,
  GitBranch, Timer, Split, Repeat,
};

// ── Category Colors ────────────────────────────────────────────────────────
export const categoryColors: Record<NodeCategory, { bg: string; border: string; text: string; icon: string }> = {
  trigger: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-emerald-500',
  },
  action: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  logic: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
  },
};

// ── Node Card ──────────────────────────────────────────────────────────────
interface NodeCardProps {
  node: NodeLibraryItem;
  onDragStart: (event: React.DragEvent, node: NodeLibraryItem) => void;
  onAdd?: (node: NodeLibraryItem) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onDragStart, onAdd }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = IconMap[node.icon];
  const colors = categoryColors[node.category];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing
        ${colors.bg} border ${colors.border}
        hover:scale-[1.02] hover:shadow-lg transition-all duration-200
        dark:hover:shadow-black/20
      `}
    >
      <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 ${colors.icon}`}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${colors.text}`}>{node.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{node.description}</p>
      </div>

      {/* Click-to-add button — appears on hover */}
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(node); }}
          title="Add to canvas"
          className={`
            flex-shrink-0 p-1.5 rounded-lg transition-all duration-200
            ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
            bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
            text-gray-600 dark:text-gray-300 shadow-sm
          `}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}

      <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

// ── Category Section ───────────────────────────────────────────────────────
interface CategorySectionProps {
  category: NodeCategory;
  title: string;
  nodes: NodeLibraryItem[];
  onDragStart: (event: React.DragEvent, node: NodeLibraryItem) => void;
  onAdd?: (node: NodeLibraryItem) => void;
  defaultExpanded?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category, title, nodes, onDragStart, onAdd, defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const colors = categoryColors[category];

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center gap-2 w-full px-3 py-2 rounded-lg
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
          ${colors.text}
        `}
      >
        {isExpanded
          ? <ChevronDown className="w-4 h-4" />
          : <ChevronRight className="w-4 h-4" />
        }
        <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          {nodes.length}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2 pl-2">
          {nodes.map((node) => (
            <NodeCard key={node.type} node={node} onDragStart={onDragStart} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── NodeLibrary Component ──────────────────────────────────────────────────
interface NodeLibraryProps {
  searchQuery?: string;
  /** Called when user clicks the + button on a node (click-to-add) */
  onAddNode?: (node: NodeLibraryItem) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ searchQuery = '', onAddNode }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filteredNodes = NODE_LIBRARY.filter(node =>
    node.label.toLowerCase().includes(localSearch.toLowerCase()) ||
    node.description.toLowerCase().includes(localSearch.toLowerCase())
  );

  const triggerNodes = filteredNodes.filter(n => n.category === 'trigger');
  const actionNodes = filteredNodes.filter(n => n.category === 'action');
  const logicNodes = filteredNodes.filter(n => n.category === 'logic');

  const onDragStart = (event: React.DragEvent, node: NodeLibraryItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(node));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Node Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-900 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
              transition-all
            "
          />
        </div>
      </div>

      {/* Node categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {triggerNodes.length > 0 && (
          <CategorySection
            category="trigger"
            title="Triggers"
            nodes={triggerNodes}
            onDragStart={onDragStart}
            onAdd={onAddNode}
          />
        )}
        {actionNodes.length > 0 && (
          <CategorySection
            category="action"
            title="Actions"
            nodes={actionNodes}
            onDragStart={onDragStart}
            onAdd={onAddNode}
          />
        )}
        {logicNodes.length > 0 && (
          <CategorySection
            category="logic"
            title="Logic"
            nodes={logicNodes}
            onDragStart={onDragStart}
            onAdd={onAddNode}
          />
        )}

        {filteredNodes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No nodes found</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Drag to canvas or click <span className="font-semibold">+</span> to add a node
        </p>
      </div>
    </div>
  );
};

export default NodeLibrary;
