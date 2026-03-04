"use client";

import React from 'react';
import {
  Save, Play, Pause, Trash2, Undo2, Redo2, ZoomIn, ZoomOut,
  Maximize2, LayoutGrid, ArrowLeft, Settings, History, Copy
} from 'lucide-react';
import { WorkflowStatus } from '@/types/workflow';

interface WorkflowToolbarProps {
  workflowName: string;
  workflowStatus: WorkflowStatus;
  isSaving: boolean;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRun: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onBack: () => void;
  onViewHistory?: () => void;
  onDuplicate?: () => void;
  /** When true the back-arrow button is hidden (parent provides its own nav) */
  hideBack?: boolean;
}

// Status badge component
const StatusBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const statusConfig = {
    draft: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      dot: 'bg-gray-400'
    },
    active: {
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    paused: {
      bg: 'bg-amber-100 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      dot: 'bg-red-500'
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
      ${config.bg} ${config.text}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Toolbar button component
interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  showLabel?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  showLabel = false
}) => {
  const variants = {
    default: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
    primary: 'hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    danger: 'hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400',
    success: 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex items-center gap-2 p-2 rounded-lg transition-colors
        ${variants[variant]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
      `}
    >
      <Icon className="w-4 h-4" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
};

// Divider component
const ToolbarDivider: React.FC = () => (
  <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
);

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  workflowName,
  workflowStatus,
  isSaving,
  hasChanges,
  canUndo,
  canRedo,
  onNameChange,
  onSave,
  onRun,
  onToggleStatus,
  onDelete,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onBack,
  onViewHistory,
  onDuplicate,
  hideBack = false,
}) => {
  return (
    <div className="
      flex items-center justify-between gap-4 px-4 py-3
      bg-white dark:bg-gray-900 
      border-b border-gray-200 dark:border-gray-800
    ">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {!hideBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Workflow name"
            className="
              text-lg font-bold text-gray-900 dark:text-white
              bg-transparent border-none outline-none
              focus:ring-0 min-w-[200px]
              placeholder-gray-400
            "
          />
          <StatusBadge status={workflowStatus} />
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Center section - Canvas controls */}
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-1">
        <ToolbarButton icon={Undo2} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={onRedo} disabled={!canRedo} />
        <ToolbarDivider />
        <ToolbarButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
        <ToolbarButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
        <ToolbarButton icon={Maximize2} label="Fit View" onClick={onFitView} />
        <ToolbarDivider />
        <ToolbarButton icon={LayoutGrid} label="Toggle Grid" onClick={() => { }} />
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {onViewHistory && (
          <ToolbarButton icon={History} label="History" onClick={onViewHistory} />
        )}
        {onDuplicate && (
          <ToolbarButton icon={Copy} label="Duplicate" onClick={onDuplicate} />
        )}
        <ToolbarButton icon={Settings} label="Settings" onClick={() => { }} />
        <ToolbarButton icon={Trash2} label="Delete" onClick={onDelete} variant="danger" />

        <ToolbarDivider />

        {workflowStatus === 'active' ? (
          <button
            onClick={onToggleStatus}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-amber-100 dark:bg-amber-500/20
              text-amber-600 dark:text-amber-400
              hover:bg-amber-200 dark:hover:bg-amber-500/30
              transition-colors text-sm font-medium
            "
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        ) : (
          <button
            onClick={onToggleStatus}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl
              bg-emerald-100 dark:bg-emerald-500/20
              text-emerald-600 dark:text-emerald-400
              hover:bg-emerald-200 dark:hover:bg-emerald-500/30
              transition-colors text-sm font-medium
            "
          >
            <Play className="w-4 h-4" />
            Activate
          </button>
        )}

        <button
          onClick={onRun}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-blue-500 hover:bg-blue-600
            text-white
            transition-colors text-sm font-medium
          "
        >
          <Play className="w-4 h-4" />
          Test Run
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-gray-900 dark:bg-white
            text-white dark:text-gray-900
            hover:bg-gray-800 dark:hover:bg-gray-100
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors text-sm font-medium
          "
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default WorkflowToolbar;
