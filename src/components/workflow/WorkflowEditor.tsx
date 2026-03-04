"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import { IWorkflow } from '@/types/workflow';

const WorkflowEditorPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;
  
  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflow
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/workflows?id=${workflowId}`);
        const data = await response.json();
        
        if (data.success) {
          setWorkflow(data.data);
        } else {
          setError(data.error || 'Failed to load workflow');
        }
      } catch (err) {
        setError('Failed to load workflow');
        console.error('Error fetching workflow:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId]);

  // Save workflow
  const handleSave = useCallback(async (updates: Partial<IWorkflow>) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowId, ...updates }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setWorkflow(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      throw err;
    }
  }, [workflowId]);

  // Delete workflow
  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows?id=${workflowId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/dashboard/workflows');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      throw err;
    }
  }, [workflowId, router]);

  // Run workflow
  const handleRun = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Workflow executed successfully!\nDuration: ${data.data.duration}ms`);
      } else {
        alert(`Workflow execution failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to run workflow:', err);
    }
  }, []);

  // Go back
  const handleBack = useCallback(() => {
    router.push('/dashboard/workflows');
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Workflow
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkflowBuilder
      workflow={workflow || undefined}
      onSave={handleSave}
      onDelete={handleDelete}
      onRun={handleRun}
      onBack={handleBack}
    />
  );
};

export default WorkflowEditorPage;
