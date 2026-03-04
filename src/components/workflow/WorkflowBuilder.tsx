"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import NodeLibrary from './NodeLibrary';
import WorkflowCanvas from './WorkflowCanvas';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowToolbar from './WorkflowToolbar';
import { WorkflowNode, WorkflowEdge, IWorkflow, WorkflowStatus, NodeLibraryItem } from '@/types/workflow';

interface WorkflowBuilderProps {
  workflow?: IWorkflow;
  onSave: (workflow: Partial<IWorkflow>) => Promise<void>;
  onDelete: () => Promise<void>;
  onRun: (workflowId: string) => Promise<void>;
  onBack: () => void;
  /** When true, the toolbar's own Back button is hidden (the parent renders its own breadcrumb) */
  hideToolbarBack?: boolean;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  onDelete,
  onRun,
  onBack,
  hideToolbarBack = false,
}) => {
  // ── Workflow state ────────────────────────────────────────────────────────
  const [workflowName, setWorkflowName] = useState(workflow?.name || 'Untitled Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>(workflow?.status || 'draft');
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow?.nodes || []);
  const [edges, setEdges] = useState<WorkflowEdge[]>(workflow?.edges || []);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // ── History for undo/redo ─────────────────────────────────────────────────
  const [history, setHistory] = useState<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [nodes, edges, workflowName, workflowStatus]);

  // ── Node select ───────────────────────────────────────────────────────────
  const handleNodeSelect = useCallback((node: WorkflowNode | null) => {
    setSelectedNode(node);
  }, []);

  // ── Node update from config panel ─────────────────────────────────────────
  const handleUpdateNode = useCallback((nodeId: string, data: Partial<WorkflowNode['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ) as WorkflowNode[]
    );
    setSelectedNode((prev) =>
      prev?.id === nodeId
        ? { ...prev, data: { ...prev.data, ...data } } as WorkflowNode
        : prev
    );
  }, []);

  // ── Node delete ───────────────────────────────────────────────────────────
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, []);

  // ── Click-to-add from node library ───────────────────────────────────────
  const handleAddNode = useCallback((item: NodeLibraryItem) => {
    // Place new node in the center of the visible canvas, offset by existing count
    const baseX = 200 + nodes.length * 20;
    const baseY = 100 + nodes.length * 60;

    const position = reactFlowInstance
      ? reactFlowInstance.screenToFlowPosition({
        x: window.innerWidth / 2 + (nodes.length % 3) * 40 - 60,
        y: window.innerHeight / 2 + Math.floor(nodes.length / 3) * 60 - 60,
      })
      : { x: baseX, y: baseY };

    const newNode: WorkflowNode = {
      id: `node-${uuidv4()}`,
      type: item.category,
      position,
      data: {
        label: item.label,
        nodeType: item.type,
        category: item.category,
        icon: item.icon,
        description: item.description,
        config: {},
        status: 'idle',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, reactFlowInstance]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave({ name: workflowName, status: workflowStatus, nodes, edges });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflowName, workflowStatus, nodes, edges, onSave]);

  // ── Run ───────────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (workflow?._id) await onRun(workflow._id);
  }, [workflow, onRun]);

  // ── Toggle status ─────────────────────────────────────────────────────────
  const handleToggleStatus = useCallback(() => {
    setWorkflowStatus((prev) => (prev === 'active' ? 'paused' : 'active'));
  }, []);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, nodes, edges]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => reactFlowInstance?.zoomIn(), [reactFlowInstance]);
  const handleZoomOut = useCallback(() => reactFlowInstance?.zoomOut(), [reactFlowInstance]);
  const handleFitView = useCallback(() => reactFlowInstance?.fitView(), [reactFlowInstance]);

  // ── Canvas change handlers ─────────────────────────────────────────────────
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    saveToHistory();
  }, [saveToHistory]);

  const handleEdgesChange = useCallback((newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
    saveToHistory();
  }, [saveToHistory]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Toolbar */}
      <WorkflowToolbar
        workflowName={workflowName}
        workflowStatus={workflowStatus}
        isSaving={isSaving}
        hasChanges={hasChanges}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onRun={handleRun}
        onToggleStatus={handleToggleStatus}
        onDelete={onDelete}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onBack={onBack}
        hideBack={hideToolbarBack}
      />

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Node Library */}
        <div className="w-72 flex-shrink-0">
          <NodeLibrary onAddNode={handleAddNode} />
        </div>

        {/* Center panel — Workflow Canvas */}
        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeSelect={handleNodeSelect}
          reactFlowInstance={reactFlowInstance}
          setReactFlowInstance={setReactFlowInstance}
        />

        {/* Right panel — Node Configuration */}
        <div className="w-80 flex-shrink-0">
          <NodeConfigPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
