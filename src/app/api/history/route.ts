import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/history - Get user's tool history
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const toolType = searchParams.get('toolType');
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {
      userId: session.user.id,
      ...(toolType && { toolType }),
      ...(favoritesOnly && { isFavorite: true }),
    };

    const [history, total] = await Promise.all([
      prisma.toolHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          toolType: true,
          title: true,
          inputData: true,
          outputData: true,
          previewUrl: true,
          isFavorite: true,
          createdAt: true,
        },
      }),
      prisma.toolHistory.count({ where }),
    ]);

    // Parse JSON fields
    const parsedHistory = history.map((item) => ({
      ...item,
      inputData: item.inputData ? JSON.parse(item.inputData) : null,
      outputData: item.outputData ? JSON.parse(item.outputData) : null,
    }));

    return NextResponse.json({
      history: parsedHistory,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST /api/history - Save a new history entry
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { toolType, title, inputData, outputData, previewUrl } = body;

    if (!toolType) {
      return NextResponse.json({ error: 'Tool type is required' }, { status: 400 });
    }

    // Limit history entries per user (keep last 100)
    const existingCount = await prisma.toolHistory.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 100) {
      // Delete oldest non-favorite entries to make room
      const oldestEntries = await prisma.toolHistory.findMany({
        where: { userId: session.user.id, isFavorite: false },
        orderBy: { createdAt: 'asc' },
        take: existingCount - 99,
        select: { id: true },
      });

      if (oldestEntries.length > 0) {
        await prisma.toolHistory.deleteMany({
          where: { id: { in: oldestEntries.map((e) => e.id) } },
        });
      }
    }

    const entry = await prisma.toolHistory.create({
      data: {
        userId: session.user.id,
        toolType,
        title: title || generateTitle(toolType, inputData),
        inputData: inputData ? JSON.stringify(inputData) : null,
        outputData: outputData ? JSON.stringify(outputData) : null,
        previewUrl,
      },
    });

    return NextResponse.json({
      id: entry.id,
      message: 'History entry saved',
    });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

// Generate a title based on tool type and input
function generateTitle(toolType: string, inputData: unknown): string {
  const data = inputData as Record<string, unknown> | null;

  const toolTitles: Record<string, string> = {
    'qr-generator': 'QR Code',
    'ai-summarizer': 'Summary',
    'ai-translator': 'Translation',
    'ai-transcriber': 'Transcription',
    'ai-image-generator': 'AI Image',
    'ai-video-generator': 'AI Video',
    'image-compressor': 'Compressed Image',
    'pdf-toolkit': 'PDF',
    'heic-converter': 'Converted Image',
  };

  const baseTitle = toolTitles[toolType] || 'Result';

  // Try to extract a meaningful snippet from input
  if (data) {
    if (typeof data.prompt === 'string') {
      return `${baseTitle}: ${data.prompt.substring(0, 30)}...`;
    }
    if (typeof data.text === 'string') {
      return `${baseTitle}: ${data.text.substring(0, 30)}...`;
    }
    if (typeof data.url === 'string') {
      return `${baseTitle}: ${data.url.substring(0, 30)}...`;
    }
  }

  return `${baseTitle} - ${new Date().toLocaleDateString()}`;
}
