import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    // Get the latest leaderboard.csv from Blob storage
    const { blobs } = await list({
      prefix: 'leaderboard.csv',
      limit: 1,
    });

    if (blobs.length === 0) {
      return NextResponse.json(
        { error: 'Leaderboard not found' },
        { status: 404 }
      );
    }

    const csvUrl = blobs[0].url;

    // Fetch the CSV content
    const response = await fetch(csvUrl, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSV from blob storage');
    }

    const csvText = await response.text();

    return new NextResponse(csvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: String(error) },
      { status: 500 }
    );
  }
}

// Enable Edge Runtime for faster responses (optional)
export const runtime = 'edge';