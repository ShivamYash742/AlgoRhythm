import { NextResponse } from 'next/server';

// GET /api/test-env - Test environment variables
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      envVars: {
        geminiApiKey: {
          exists: !!process.env.GEMINI_API_KEY,
          length: process.env.GEMINI_API_KEY?.length || 0,
          start: process.env.GEMINI_API_KEY?.substring(0, 10) + '...' || 'undefined'
        },
        databaseUrl: {
          exists: !!process.env.DATABASE_URL,
          length: process.env.DATABASE_URL?.length || 0,
          start: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'undefined'
        },
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
