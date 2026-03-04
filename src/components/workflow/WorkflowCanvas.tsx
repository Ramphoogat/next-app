"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
} from '@xyflow/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CSS import works at runtime
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { nodeTypes } from './CustomNodes';
import { WorkflowNode, WorkflowEdge, NodeLibraryItem, WorkflowNodeData } from '@/types/workflow';

interface WorkflowCanvasProps {
  initialNodes: WorkflowNode[];
  initialEdges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onNodeSelect: (node: WorkflowNode | null) => void;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  reactFlowInstance,
  setReactFlowInstance,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodes, setNodes] = useNodesState(initialNodes as any);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // ── Sync external node additions/deletions into local RF state ────────────
  // useNodesState ONLY uses initialNodes at mount. When the parent removes a
  // node (e.g. via the config panel's Delete button), we need to push that
  // change into RF's internal state.
  // We compare the JOIN of node IDs so position drags don't trigger a resync.
  const nodeIdStr = initialNodes.map(n => n.id).join(',');
  const edgeIdStr = initialEdges.map(e => e.id).join(',');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNodes(initialNodes as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeIdStr]); // intentionally use the stable string, not the array ref

  useEffect(() => {
    setEdges(initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeIdStr]);

  // ── Node changes (move, select, keyboard DELETE, etc.) ────────────────────
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNodes((nds: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = applyNodeChanges(changes, nds) as any;
        setTimeout(() => onNodesChange(updated as WorkflowNode[]), 0);
        return updated;
      });
    },
    [setNodes, onNodesChange]
  );

  // ── Edge changes (select, keyboard DELETE, etc.) ──────────────────────────
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        setTimeout(() => onEdgesChange(updated as WorkflowEdge[]), 0);
        return updated;
      });
    },
    [setEdges, onEdgesChange]
  );

  // ── New connection drawn by user ──────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${uuidv4()}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#6366f1',
        },
      } as Edge;

      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);
        setTimeout(() => onEdgesChange(newEdges as WorkflowEdge[]), 0);
        return newEdges;
      });
    },
    [setEdges, onEdgesChange]
  );

  // ── Node selection → updates config panel ────────────────────────────────
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      if (selectedNodes.length === 1) {
        onNodeSelect(selectedNodes[0] as WorkflowNode);
      } else {
        onNodeSelect(null);
      }
    },
    [onNodeSelect]
  );

  // ── Drag-and-drop from node library ──────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Re-focus the canvas so keyboard Delete works immediately after drop
      wrapperRef.current?.focus();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data || !reactFlowInstance) return;

      // screenToFlowPosition converts raw screen (viewport) coordinates
      // to React Flow canvas coordinates. It already accounts for the
      // canvas element's offset, zoom, and pan — do NOT subtract bounds.
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeData: NodeLibraryItem = JSON.parse(data);

      const newNode: WorkflowNode = {
        id: `node-${uuidv4()}`,
        type: nodeData.category,
        position,
        data: {
          label: nodeData.label,
          nodeType: nodeData.type,
          category: nodeData.category,
          icon: nodeData.icon,
          description: nodeData.description,
          config: {},
          status: 'idle',
        } as unknown as WorkflowNodeData,
      };

      setNodes((nds) => {
        const newNodes = [...nds, newNode] as WorkflowNode[];
        setTimeout(() => onNodesChange(newNodes), 0);
        return newNodes;
      });
    },
    [reactFlowInstance, setNodes, onNodesChange]
  );

  // ── Reactive dark mode ────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const bg = isDark ? '#111827' : '#ffffff';
  const border = isDark ? '#374151' : '#e5e7eb';
  const btnColor = isDark ? '#9ca3af' : '#4b5563';
  const bgHover = isDark ? '#1f2937' : '#f3f4f6';
  const minimapBg = isDark ? '#111827' : '#f9fafb';
  const dotColor = isDark ? '#374151' : '#d1d5db';

  return (
    // tabIndex makes the wrapper focusable so keyboard events (Delete key)
    // reach React Flow even after the user has clicked elsewhere.
    <div
      ref={wrapperRef}
      className="flex-1 h-full outline-none"
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        // Re-focus the wrapper when the user clicks inside the canvas
        onClick={() => wrapperRef.current?.focus()}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#6366f1',
          },
        }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-gray-50 dark:bg-gray-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={dotColor} />

        <Controls
          style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
            '--xy-controls-button-background-color': bg,
            '--xy-controls-button-color': btnColor,
            '--xy-controls-button-border-color': border,
            '--xy-controls-button-background-color-hover': bgHover,
          } as React.CSSProperties}
        />

        <MiniMap
          nodeStrokeWidth={3}
          style={{
            background: minimapBg,
            border: `1px solid ${border}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}
          nodeColor={(node) => {
            const d = node.data as WorkflowNodeData;
            switch (d?.category) {
              case 'trigger': return '#10b981';
              case 'action': return '#3b82f6';
              case 'logic': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner {...props} />
  </ReactFlowProvider>
);

export default WorkflowCanvas;
