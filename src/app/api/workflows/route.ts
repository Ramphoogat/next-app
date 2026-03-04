import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import { verifyAuth } from '@/lib/auth-helpers';

// GET - List all workflows or get single workflow
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const workflow = await Workflow.findOne({ _id: id, createdBy: auth.userId });
      if (!workflow) {
        return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: workflow });
    }

    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { createdBy: auth.userId };
    if (status && status !== 'all') query.status = status;
    if (search) query.$text = { $search: search };

    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Workflow.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: workflows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

  } catch (error) {
    console.error('GET /api/workflows error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST - Create new workflow
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, nodes, edges, status, tags } = body;

    const workflow = await Workflow.create({
      name: name || 'Untitled Workflow',
      description,
      nodes: nodes || [],
      edges: edges || [],
      status: status || 'draft',
      tags: tags || [],
      createdBy: auth.userId,
    });

    return NextResponse.json(
      { success: true, data: workflow, message: 'Workflow created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/workflows error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create workflow' }, { status: 500 });
  }
}

// PUT - Update workflow
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, nodes, edges, status, tags } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Workflow ID is required' }, { status: 400 });
    }

    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, createdBy: auth.userId },
      {
        $set: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(nodes && { nodes }),
          ...(edges && { edges }),
          ...(status && { status }),
          ...(tags && { tags }),
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: workflow, message: 'Workflow updated successfully' });

  } catch (error) {
    console.error('PUT /api/workflows error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update workflow' }, { status: 500 });
  }
}

// DELETE - Delete workflow
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Workflow ID is required' }, { status: 400 });
    }

    const workflow = await Workflow.findOneAndDelete({ _id: id, createdBy: auth.userId });

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Workflow deleted successfully' });

  } catch (error) {
    console.error('DELETE /api/workflows error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete workflow' }, { status: 500 });
  }
}

