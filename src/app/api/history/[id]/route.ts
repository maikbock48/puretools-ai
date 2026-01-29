import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/history/[id] - Get a single history entry
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    const { id } = await context.params;

    const entry = await prisma.toolHistory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...entry,
      inputData: entry.inputData ? JSON.parse(entry.inputData) : null,
      outputData: entry.outputData ? JSON.parse(entry.outputData) : null,
    });
  } catch (error) {
    console.error('Error fetching history entry:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

// PATCH /api/history/[id] - Update a history entry (toggle favorite, update title)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { isFavorite, title } = body;

    // Verify ownership
    const existing = await prisma.toolHistory.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const updateData: { isFavorite?: boolean; title?: string } = {};
    if (typeof isFavorite === 'boolean') {
      updateData.isFavorite = isFavorite;
    }
    if (typeof title === 'string') {
      updateData.title = title;
    }

    const updated = await prisma.toolHistory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      isFavorite: updated.isFavorite,
      title: updated.title,
      message: 'Entry updated',
    });
  } catch (error) {
    console.error('Error updating history entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

// DELETE /api/history/[id] - Delete a history entry
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );
    }

    const { id } = await context.params;

    // Verify ownership and delete
    const deleted = await prisma.toolHistory.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
