"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, MoreVertical, Play, Pause, Trash2, 
  Copy, Clock, CheckCircle2, AlertCircle, Zap, ChevronDown
} from 'lucide-react';
import { IWorkflow, WorkflowStatus } from '@/types/workflow';

// Status badge component
const StatusBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const config = {
    draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Clock },
    active: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    paused: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: Pause },
    error: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', icon: AlertCircle },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Workflow card component
interface WorkflowCardProps {
  workflow: IWorkflow;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleStatus: (id: string, status: WorkflowStatus) => void;
  onRun: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onRun,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div 
      className="
        group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
        hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 
        transition-all duration-200 overflow-hidden
      "
    >
      {/* Card header */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => onEdit(workflow._id!)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {workflow.nodes?.length || 0} nodes · {workflow.edges?.length || 0} connections
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)} 
                />
                <div className="
                  absolute right-0 mt-1 w-48 py-2 z-20
                  bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                ">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRun(workflow._id!);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Play className="w-4 h-4 text-blue-500" />
                    <span>Test Run</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(
                        workflow._id!,
                        workflow.status === 'active' ? 'paused' : 'active'
                      );
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {workflow.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 text-amber-500" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-emerald-500" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(workflow._id!);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Duplicate</span>
                  </button>
                  <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(workflow._id!);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
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
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {workflow.description}
          </p>
        )}

        <StatusBadge status={workflow.status} />
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Updated {new Date(workflow.updatedAt).toLocaleDateString()}
          </span>
          {workflow.lastRunAt && (
            <span>
              Last run {new Date(workflow.lastRunAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main workflows list component
const WorkflowsList: React.FC = () => {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Fetch workflows
  const fetchWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/workflows?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setWorkflows(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Create new workflow
  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Workflow' }),
      });
      const data = await response.json();
      
      if (data.success) {
        router.push(`/dashboard/workflows/${data.data._id}`);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  // Edit workflow
  const handleEditWorkflow = (id: string) => {
    router.push(`/dashboard/workflows/${id}`);
  };

  // Delete workflow
  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      const response = await fetch(`/api/workflows?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkflows(workflows.filter(w => w._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  // Duplicate workflow
  const handleDuplicateWorkflow = async (id: string) => {
    const workflow = workflows.find(w => w._id === id);
    if (!workflow) return;

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkflows([data.data, ...workflows]);
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  };

  // Toggle workflow status
  const handleToggleStatus = async (id: string, status: WorkflowStatus) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkflows(workflows.map(w => 
          w._id === id ? { ...w, status } : w
        ));
      }
    } catch (error) {
      console.error('Failed to update workflow status:', error);
    }
  };

  // Run workflow
  const handleRunWorkflow = async (id: string) => {
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: id }),
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Workflow executed successfully!');
        fetchWorkflows();
      } else {
        alert(`Workflow execution failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Workflows</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Build and manage your automation workflows
            </p>
          </div>
          
          <button
            onClick={handleCreateWorkflow}
            className="
              flex items-center gap-2 px-5 py-3 rounded-xl
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white font-semibold
              hover:from-orange-600 hover:to-orange-700
              shadow-lg shadow-orange-500/30
              transition-all duration-200
            "
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 rounded-xl
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                text-gray-900 dark:text-white
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                transition-all
              "
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="
                flex items-center gap-2 px-4 py-3 rounded-xl
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                text-gray-700 dark:text-gray-300
                hover:border-gray-300 dark:hover:border-gray-700
                transition-all
              "
            >
              <Filter className="w-4 h-4" />
              <span>Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {filterMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterMenuOpen(false)} />
                <div className="
                  absolute right-0 mt-2 w-40 py-2 z-20
                  bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                ">
                  {['all', 'draft', 'active', 'paused', 'error'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as WorkflowStatus | 'all');
                        setFilterMenuOpen(false);
                      }}
                      className={`
                        w-full px-4 py-2 text-left text-sm
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        ${statusFilter === status ? 'text-orange-600 font-medium' : 'text-gray-700 dark:text-gray-300'}
                      `}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workflows grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No workflows yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first workflow to start automating
            </p>
            <button
              onClick={handleCreateWorkflow}
              className="
                inline-flex items-center gap-2 px-5 py-3 rounded-xl
                bg-orange-500 hover:bg-orange-600
                text-white font-semibold
                transition-colors
              "
            >
              <Plus className="w-5 h-5" />
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow._id}
                workflow={workflow}
                onEdit={handleEditWorkflow}
                onDelete={handleDeleteWorkflow}
                onDuplicate={handleDuplicateWorkflow}
                onToggleStatus={handleToggleStatus}
                onRun={handleRunWorkflow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsList;
