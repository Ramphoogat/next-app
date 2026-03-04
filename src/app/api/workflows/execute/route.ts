import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import WorkflowExecutionLog from '@/models/WorkflowExecutionLog';
import { verifyAuth } from '@/lib/auth-helpers';
import { executeWorkflow } from '@/lib/workflowEngine';
import { v4 as uuidv4 } from 'uuid';

// POST - Execute a workflow
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workflowId, triggerData = {}, triggerType = 'manual' } = body;

    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Workflow ID is required' }, { status: 400 });
    }

    const workflow = await Workflow.findOne({ _id: workflowId, createdBy: auth.userId });
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    const executionId = uuidv4();
    const executionLog = await WorkflowExecutionLog.create({
      workflowId: workflow._id,
      workflowName: workflow.name,
      status: 'running',
      triggeredBy: auth.userId,
      triggerType,
      context: triggerData,
    });

    try {
      const workflowNodes = JSON.parse(JSON.stringify(workflow.nodes));
      const workflowEdges = JSON.parse(JSON.stringify(workflow.edges));

      const result = await executeWorkflow(workflowNodes, workflowEdges, triggerData, executionId);

      executionLog.status = result.success ? 'success' : 'error';
      executionLog.completedAt = new Date();
      executionLog.duration = result.duration;
      (executionLog as { nodeExecutions: unknown }).nodeExecutions = result.nodeExecutions;
      if (result.error) executionLog.error = result.error;
      await executionLog.save();

      await Workflow.findByIdAndUpdate(workflowId, {
        lastRunAt: new Date(),
        ...(result.error && { status: 'error' }),
      });

      return NextResponse.json({
        success: true,
        data: {
          executionId: executionLog._id,
          status: result.success ? 'success' : 'error',
          duration: result.duration,
          nodeExecutions: result.nodeExecutions,
          error: result.error,
        },
        message: result.success ? 'Workflow executed successfully' : 'Workflow execution failed',
      });

    } catch (error) {
      executionLog.status = 'error';
      executionLog.completedAt = new Date();
      executionLog.error = error instanceof Error ? error.message : 'Unknown error';
      await executionLog.save();
      throw error;
    }

  } catch (error) {
    console.error('POST /api/workflows/execute error:', error);
    return NextResponse.json({ success: false, error: 'Failed to execute workflow' }, { status: 500 });
  }
}

// GET - Get execution logs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const executionId = searchParams.get('executionId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (executionId) {
      const execution = await WorkflowExecutionLog.findById(executionId);
      if (!execution) {
        return NextResponse.json({ success: false, error: 'Execution log not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: execution });
    }

    if (workflowId) {
      const workflow = await Workflow.findOne({ _id: workflowId, createdBy: auth.userId });
      if (!workflow) {
        return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
      }

      const [executions, total] = await Promise.all([
        WorkflowExecutionLog.find({ workflowId }).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
        WorkflowExecutionLog.countDocuments({ workflowId }),
      ]);

      return NextResponse.json({
        success: true,
        data: executions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    const userWorkflows = await Workflow.find({ createdBy: auth.userId }, { _id: 1 }).lean();
    const workflowIds = userWorkflows.map(w => w._id);

    const [executions, total] = await Promise.all([
      WorkflowExecutionLog.find({ workflowId: { $in: workflowIds } }).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
      WorkflowExecutionLog.countDocuments({ workflowId: { $in: workflowIds } }),
    ]);

    return NextResponse.json({
      success: true,
      data: executions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

  } catch (error) {
    console.error('GET /api/workflows/execute error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch execution logs' }, { status: 500 });
  }
}
