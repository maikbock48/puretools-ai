import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { auth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { SUPPORTED_FILE_TYPES } from '@/lib/ai-config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit
    const { allowed, resetIn } = checkRateLimit(request, RATE_LIMITS.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429, headers: { 'Retry-After': Math.ceil(resetIn / 1000).toString() } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    const maxSize = SUPPORTED_FILE_TYPES.translate.maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${SUPPORTED_FILE_TYPES.translate.maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    let text = '';

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // Plain text or markdown
      text = await file.text();
    } else if (fileName.endsWith('.docx')) {
      // DOCX file
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (fileName.endsWith('.pdf')) {
      // PDF file - dynamic import to avoid build issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await pdfParse(buffer);
      text = result.text;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload TXT, MD, DOCX, or PDF files.' },
        { status: 400 }
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive blank lines
      .trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text from file. The file may be empty or corrupted.' },
        { status: 400 }
      );
    }

    // Calculate word count
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

    return NextResponse.json({
      text,
      wordCount,
      fileName: file.name,
      fileType: fileName.split('.').pop(),
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please try a different file.' },
      { status: 500 }
    );
  }
}
