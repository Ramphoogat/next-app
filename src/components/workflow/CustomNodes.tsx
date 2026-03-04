"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Webhook, Clock, FileText, Zap, Mail, Globe, Database, Bell,
  GitBranch, Timer, Split, Repeat, CheckCircle2, AlertCircle,
  Loader2, Link2, Plus
} from 'lucide-react';
import { WorkflowNodeData, NodeCategory } from '@/types/workflow';

// ── Icon map ──────────────────────────────────────────────────────────────
const IconMap: Record<string, React.ElementType> = {
  Webhook, Clock, FileText, Zap, Mail, Globe, Database,
  Bell, GitBranch, Timer, Split, Repeat, Link2,
};

// ── Per-category colour tokens ────────────────────────────────────────────
const CAT: Record<NodeCategory, { accent: string; bg: string; text: string; ring: string; handle: string }> = {
  trigger: {
    accent: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-400', handle: '#10b981',
  },
  action: {
    accent: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-400', handle: '#3b82f6',
  },
  logic: {
    accent: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    ring: 'ring-purple-400', handle: '#8b5cf6',
  },
};

// ── Shared handle style ────────────────────────────────────────────────────
// Only visual CSS — React Flow owns position/top/left/right/transform
// via its .react-flow__handle-* classes. Never override those.
const handleStyle = (color: string, visible: boolean): React.CSSProperties => ({
  width: visible ? 14 : 10,
  height: visible ? 14 : 10,
  borderRadius: '50%',
  background: visible ? color : 'white',
  border: `2px solid ${color}`,
  opacity: visible ? 1 : 0.35,
  transition: 'all 0.2s ease',
  cursor: 'crosshair',
  zIndex: 20,
  boxShadow: visible ? `0 0 0 3px ${color}33, 0 2px 8px rgba(0,0,0,0.2)` : 'none',
});

// ── Status badge ──────────────────────────────────────────────────────────
const Status: React.FC<{ status?: string }> = ({ status }) => {
  if (status === 'running') return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />;
  if (status === 'success') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
  return null;
};

// ── Base node ─────────────────────────────────────────────────────────────
interface CustomNodeProps extends Omit<NodeProps, 'data'> {
  data: WorkflowNodeData;
}

const BaseNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const [hovered, setHovered] = useState(false);

  const isConnector = data.nodeType === 'node-connector';
  const isBranching = data.nodeType === 'if-condition' || data.nodeType === 'switch';

  const cat = isConnector
    ? { accent: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-400', handle: '#6366f1' }
    : CAT[data.category];

  const Icon = IconMap[data.icon];
  // handles are fully visible on hover OR when node is selected
  const showH = hovered || selected;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative min-w-[180px] max-w-[240px]
        rounded-2xl overflow-visible
        bg-white dark:bg-gray-900
        border-2 transition-all duration-200
        ${selected
          ? `border-[${cat.accent}] shadow-xl`
          : 'border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      style={selected ? { borderColor: cat.accent } : {}}
    >
      {/* ── Node content ─────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-3">
        {/* Icon + label row */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="flex-shrink-0 p-1.5 rounded-lg"
            style={{ background: `${cat.accent}1a` }}
          >
            {Icon && <Icon className="w-4 h-4" style={{ color: cat.accent }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {data.label}
            </p>
            <p className={`text-[11px] font-medium uppercase tracking-wide ${cat.text}`}>
              {isConnector ? 'Connector' : data.category}
            </p>
          </div>
          <Status status={data.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {data.description || 'No description'}
        </p>

        {/* Config preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className={`mt-2 px-2 py-1.5 rounded-lg text-[11px] font-mono ${cat.bg} ${cat.text}`}>
            {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
              <span key={k} className="block truncate">{k}: {String(v).substring(0, 24)}</span>
            ))}
          </div>
        )}
      </div>

      {/*
        ══════════════════════════════════════════════════════════════════
        CONNECTION HANDLES — Mindmap style

        • Handles are subtle (hollow, semi-transparent) when the node
          is idle. They glow and fill solid when you hover the node,
          making connection points obvious without clutter.

        • EVERY node has BOTH a Left (target) and Right (source) handle
          so any node can connect to any other node.

        • Do NOT set right/left/top/bottom/transform in handleStyle —
          React Flow's CSS classes own those. Adding them here breaks
          the connection hit-testing.
        ══════════════════════════════════════════════════════════════════
      */}

      {/* LEFT — incoming (target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable
        style={handleStyle(cat.handle, showH)}
      />

      {/* RIGHT — outgoing (source) */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable
        style={handleStyle(cat.handle, showH)}
      >
        {/* Mindmap-style "+" hint shown on hover */}
        {showH && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Plus
              className="w-2.5 h-2.5"
              style={{ color: cat.handle, filter: 'brightness(0) invert(1)' }}
            />
          </span>
        )}
      </Handle>

      {/* IF / Switch — TRUE branch (upper-right) */}
      {isBranching && (
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          isConnectable
          style={{ ...handleStyle('#10b981', showH), top: '30%' }}
          title="True"
        />
      )}

      {/* IF / Switch — FALSE branch (lower-right) */}
      {isBranching && (
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          isConnectable
          style={{ ...handleStyle('#ef4444', showH), top: '70%' }}
          title="False"
        />
      )}

      {/* Node Connector — also top/bottom for vertical routing */}
      {isConnector && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="in-top"
            isConnectable
            style={handleStyle(cat.handle, showH)}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="out-bottom"
            isConnectable
            style={handleStyle(cat.handle, showH)}
          />
        </>
      )}
    </div>
  );
};

// ── Memoised exports ──────────────────────────────────────────────────────
export const TriggerNode = memo(BaseNode);
export const ActionNode = memo(BaseNode);
export const LogicNode = memo(BaseNode);

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
};

export default BaseNode;
