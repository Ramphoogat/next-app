"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Play, Pause, Trash2,
  Copy, Zap, ChevronDown, ArrowLeft, Pencil, Check, X, AlertTriangle
} from 'lucide-react';
import { IWorkflow, WorkflowStatus } from '@/types/workflow';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import { useToast } from '@/components/ToastProvider';

// ─── Confirm Dialog ───────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, message, confirmLabel = 'Delete', onConfirm, onCancel,
}) => {
  if (!open) return null;
  return (
    // Full-screen backdrop
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Blurred semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog panel */}
      <div
        className="
          relative z-10 w-full max-w-md
          bg-white dark:bg-gray-900
          rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          animate-in zoom-in-95 fade-in duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-red-100 dark:bg-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4">
          <button
            onClick={onCancel}
            className="
              px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-gray-100 dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors
            "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="
              px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-red-600 hover:bg-red-700
              text-white shadow-lg shadow-red-500/25
              transition-all duration-200
            "
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const config = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400', pulse: false },
    active: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', pulse: true },
    paused: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', pulse: false },
    error: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', pulse: false },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface WorkflowCardProps {
  workflow: IWorkflow;
  onEdit: (workflow: IWorkflow) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleStatus: (id: string, status: WorkflowStatus) => void;
  onRun: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow, onEdit, onDelete, onDuplicate, onRename, onToggleStatus, onRun,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(workflow.name);

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflow.name) onRename(workflow._id!, trimmed);
    else setNameValue(workflow.name); // revert if blank / unchanged
    setRenaming(false);
  };

  return (
    // NOTE: no overflow-hidden here — it clips the absolute dropdown menu.
    // Rounded corners still render fine with rounded-2xl + border alone.
    <div
      className="
        group relative bg-white dark:bg-gray-800/60 rounded-2xl
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-300 dark:hover:border-orange-500/40
        transition-all duration-300
      "
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          {/* Icon + name + status */}
          <div className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => !renaming && onEdit(workflow)}>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {renaming ? (
                /* Inline rename input */
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') { setNameValue(workflow.name); setRenaming(false); }
                    }}
                    className="
                      flex-1 min-w-0 text-sm font-bold bg-transparent border-b-2
                      border-orange-500 outline-none text-gray-900 dark:text-white py-0.5
                    "
                  />
                  <button onClick={commitRename} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                  <button onClick={() => { setNameValue(workflow.name); setRenaming(false); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ) : (
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                  {workflow.name}
                </h3>
              )}
              {/* Status badge directly under the name */}
              <div className="mt-1">
                <StatusBadge status={workflow.status} />
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                {/* Menu — z-40 so it renders on top of everything */}
                <div className="
                  absolute right-0 top-full mt-1 w-52 py-1.5 z-40
                  bg-white dark:bg-gray-800 rounded-xl
                  shadow-2xl shadow-black/20
                  border border-gray-200 dark:border-gray-700
                ">
                  {/* Rename */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenaming(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                    <span>Rename</span>
                  </button>

                  {/* Test Run */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRun(workflow._id!); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <Play className="w-4 h-4 text-blue-500" />
                    <span>Test Run</span>
                  </button>

                  {/* Activate / Pause */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(workflow._id!, workflow.status === 'active' ? 'paused' : 'active');
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    {workflow.status === 'active'
                      ? <><Pause className="w-4 h-4 text-amber-500" /><span>Pause Workflow</span></>
                      : <><Play className="w-4 h-4 text-emerald-500" /><span>Activate Workflow</span></>
                    }
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(workflow._id!); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Duplicate</span>
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(workflow._id!); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {workflow.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 mt-1">
            {workflow.description}
          </p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {workflow.nodes?.length || 0} nodes · {workflow.edges?.length || 0} connections
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 rounded-b-2xl bg-gray-50/80 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
          {workflow.lastRunAt && (
            <span>Last run {new Date(workflow.lastRunAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Auth helpers ──────────────────────────────────────────────────────────
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
    : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Empty State ───────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="flex-1 flex items-center justify-center py-24">
    <div className="text-center max-w-sm">
      <div className="relative inline-flex mb-6">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl" />
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
          <Zap className="w-10 h-10 text-emerald-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No workflows yet</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
        Build powerful automations by connecting triggers, actions, and logic nodes.
      </p>
      <button
        onClick={onCreate}
        className="
          inline-flex items-center gap-2 px-6 py-3 rounded-xl
          bg-gradient-to-r from-emerald-500 to-emerald-600
          text-white font-semibold
          hover:from-emerald-600 hover:to-emerald-700
          shadow-lg shadow-emerald-500/30
          transition-all duration-200 text-sm
        "
      >
        <Plus className="w-5 h-5" />
        Create Your First Workflow
      </button>
    </div>
  </div>
);

// ─── Workflow List View ────────────────────────────────────────────────────
interface WorkflowListViewProps {
  workflows: IWorkflow[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: WorkflowStatus | 'all';
  filterMenuOpen: boolean;
  onSearchChange: (q: string) => void;
  onFilterChange: (f: WorkflowStatus | 'all') => void;
  onFilterMenuToggle: () => void;
  onFilterMenuClose: () => void;
  onCreate: () => void;
  onEdit: (workflow: IWorkflow) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onToggleStatus: (id: string, status: WorkflowStatus) => void;
  onRun: (id: string) => void;
}

const WorkflowListView: React.FC<WorkflowListViewProps> = ({
  workflows, isLoading, searchQuery, statusFilter, filterMenuOpen,
  onSearchChange, onFilterChange, onFilterMenuToggle, onFilterMenuClose,
  onCreate, onEdit, onDelete, onDuplicate, onRename, onToggleStatus, onRun,
}) => (
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Workflow Automation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Build and manage your automation workflows
        </p>
      </div>
      <button
        onClick={onCreate}
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-gradient-to-r from-emerald-500 to-emerald-600
          text-white font-semibold text-sm
          hover:from-emerald-600 hover:to-emerald-700
          shadow-lg shadow-emerald-500/25
          transition-all duration-200
        "
      >
        <Plus className="w-4 h-4" />
        New Workflow
      </button>
    </div>

    {/* Filters */}
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
            transition-all
          "
        />
      </div>

      <div className="relative">
        <button
          onClick={onFilterMenuToggle}
          className="
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-300
            hover:border-gray-300 dark:hover:border-gray-600
            transition-all
          "
        >
          <Filter className="w-4 h-4" />
          <span>{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {filterMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onFilterMenuClose} />
            <div className="
              absolute right-0 mt-2 w-40 py-2 z-20
              bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
            ">
              {(['all', 'draft', 'active', 'paused', 'error'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { onFilterChange(s); onFilterMenuClose(); }}
                  className={`
                    w-full px-4 py-2 text-left text-sm
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    ${statusFilter === s ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}
                  `}
                >
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Stats row */}
    {!isLoading && workflows.length > 0 && (
      <div className="flex items-center gap-3 mb-4">
        {[
          { label: 'Total', count: workflows.length, color: 'text-gray-600 dark:text-gray-400' },
          { label: 'Active', count: workflows.filter(w => w.status === 'active').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Draft', count: workflows.filter(w => w.status === 'draft').length, color: 'text-gray-500 dark:text-gray-500' },
          { label: 'Paused', count: workflows.filter(w => w.status === 'paused').length, color: 'text-amber-600 dark:text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-1.5 text-xs">
            <span className={`font-bold ${stat.color}`}>{stat.count}</span>
            <span className="text-gray-400">{stat.label}</span>
            {stat.label !== 'Paused' && <span className="text-gray-200 dark:text-gray-700">·</span>}
          </div>
        ))}
      </div>
    )}

    {/* Grid */}
    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading your workflows...</p>
          </div>
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow._id}
              workflow={workflow}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onRename={onRename}
              onToggleStatus={onToggleStatus}
              onRun={onRun}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Inline Editor Header (breadcrumb bar) ─────────────────────────────────
interface EditorHeaderProps {
  workflowName: string;
  onBack: () => void;
}
const EditorHeader: React.FC<EditorHeaderProps> = ({ workflowName, onBack }) => (
  <div className="flex items-center gap-2 mb-0 px-0 py-3 border-b border-gray-200 dark:border-gray-700">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      <span>Workflows</span>
    </button>
    <span className="text-gray-300 dark:text-gray-600">/</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">{workflowName}</span>
  </div>
);

// ─── Main Workflow Component ───────────────────────────────────────────────
const Workflow: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Inline editor state
  const [editingWorkflow, setEditingWorkflow] = useState<IWorkflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false, title: '', message: '', onConfirm: () => { },
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) =>
    setConfirmDialog({ open: true, title, message, onConfirm });

  const closeConfirm = () =>
    setConfirmDialog(d => ({ ...d, open: false }));

  // ── Fetch workflows ──────────────────────────────────────────────────────
  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/workflows?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) setWorkflows(data.data || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: 'Untitled Workflow' }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setEditingWorkflow(data.data);
        showSuccess('Workflow created!');
      } else {
        showError('Failed to create workflow');
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      showError('Failed to create workflow');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEditWorkflow = (workflow: IWorkflow) => {
    setEditingWorkflow(workflow);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSaveWorkflow = async (updates: Partial<IWorkflow>) => {
    if (!editingWorkflow?._id) return;
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: editingWorkflow._id, ...updates }),
      });
      const data = await response.json();
      if (data.success) {
        setEditingWorkflow(data.data);
        // Update the list in background without switching view
        setWorkflows(prev =>
          prev.some(w => w._id === data.data._id)
            ? prev.map(w => w._id === data.data._id ? data.data : w)
            : [data.data, ...prev]
        );
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteWorkflow = (id: string) => {
    openConfirm(
      'Delete Workflow',
      'Are you sure you want to delete this workflow? This action cannot be undone.',
      async () => {
        closeConfirm();
        try {
          const response = await fetch(`/api/workflows?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          const data = await response.json();
          if (data.success) {
            setWorkflows(prev => prev.filter(w => w._id !== id));
            if (editingWorkflow?._id === id) setEditingWorkflow(null);
            showSuccess('Workflow deleted');
          } else {
            showError('Failed to delete workflow');
          }
        } catch (error) {
          console.error('Failed to delete workflow:', error);
          showError('Failed to delete workflow');
        }
      }
    );
  };

  const handleDeleteFromEditor = async () => {
    if (!editingWorkflow?._id) return;
    await handleDeleteWorkflow(editingWorkflow._id);
  };

  // ── Duplicate ────────────────────────────────────────────────────────────
  const handleDuplicateWorkflow = async (id: string) => {
    const workflow = workflows.find(w => w._id === id);
    if (!workflow) return;
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkflows(prev => [data.data, ...prev]);
        showSuccess('Workflow duplicated');
      } else {
        showError('Failed to duplicate workflow');
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      showError('Failed to duplicate workflow');
    }
  };

  // ── Toggle Status ────────────────────────────────────────────────────────
  const handleToggleStatus = async (id: string, status: WorkflowStatus) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkflows(prev => prev.map(w => w._id === id ? { ...w, status } : w));
        if (editingWorkflow?._id === id) setEditingWorkflow(prev => prev ? { ...prev, status } : prev);
        showSuccess(status === 'active' ? 'Workflow activated' : 'Workflow paused');
      } else {
        showError('Failed to update workflow status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      showError('Failed to update workflow status');
    }
  };

  // ── Rename ───────────────────────────────────────────────────────────────
  const handleRenameWorkflow = async (id: string, name: string) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, name }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkflows(prev => prev.map(w => w._id === id ? { ...w, name } : w));
        showSuccess('Workflow renamed');
      } else {
        showError('Failed to rename workflow');
      }
    } catch (error) {
      console.error('Failed to rename workflow:', error);
      showError('Failed to rename workflow');
    }
  };

  // ── Run ──────────────────────────────────────────────────────────────────
  const handleRunWorkflow = async (id: string) => {
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ workflowId: id }),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Workflow executed successfully!');
        fetchWorkflows();
      } else {
        showError(`Execution failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      showError('Failed to run workflow');
    }
  };

  // Suppress unused var warning
  void showInfo;

  // ── Close editor (go back to list) ───────────────────────────────────────
  const handleCloseEditor = () => {
    setEditingWorkflow(null);
    fetchWorkflows();
  };

  // ── Render: inline editor ────────────────────────────────────────────────────
  if (editingWorkflow) {
    return (
      <div className="h-full flex flex-col">
        <EditorHeader
          workflowName={editingWorkflow.name || 'Untitled Workflow'}
          onBack={handleCloseEditor}
        />
        <div className="flex-1 overflow-hidden">
          <WorkflowBuilder
            workflow={editingWorkflow}
            onSave={handleSaveWorkflow}
            onDelete={handleDeleteFromEditor}
            onRun={(id) => handleRunWorkflow(id)}
            onBack={handleCloseEditor}
            hideToolbarBack
          />
        </div>

        {/* Confirm dialog renders above the editor too */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirm}
        />
      </div>
    );
  }

  // ── Render: workflow list ─────────────────────────────────────────────────
  return (
    <>
      <WorkflowListView
        workflows={workflows}
        isLoading={isLoading || isCreating}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        filterMenuOpen={filterMenuOpen}
        onSearchChange={setSearchQuery}
        onFilterChange={setStatusFilter}
        onFilterMenuToggle={() => setFilterMenuOpen(v => !v)}
        onFilterMenuClose={() => setFilterMenuOpen(false)}
        onCreate={handleCreateWorkflow}
        onEdit={handleEditWorkflow}
        onDelete={handleDeleteWorkflow}
        onDuplicate={handleDuplicateWorkflow}
        onRename={handleRenameWorkflow}
        onToggleStatus={handleToggleStatus}
        onRun={handleRunWorkflow}
      />

      {/* Confirm dialog — renders above the list */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default Workflow;
