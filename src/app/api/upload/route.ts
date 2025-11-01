import { NextRequest, NextResponse } from 'next/server';
import { put, del, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file: File = formData.get('file') as File;
    const password = formData.get('password');

    console.log('Password check:', password);
    console.log('Expected:', process.env.ADMIN_PASSWORD);

    // Validate password
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read file content for validation
    const text = await file.text();
    const lines = text.trim().split('\n');

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header and one data row' },
        { status: 400 }
      );
    }

    // Delete existing leaderboard files
    try {
      const { blobs } = await list({
        prefix: 'leaderboard',
      });

      // Delete all existing leaderboard files
      for (const blob of blobs) {
        await del(blob.url);
        console.log('Deleted old file:', blob.url);
      }
    } catch (delError) {
      console.log('No existing file to delete or deletion failed:', delError);
      // Continue anyway - file might not exist
    }

    // Upload new file to Vercel Blob
    const blob = await put('leaderboard.csv', file, {
      access: 'public',
      addRandomSuffix: false, // No need for random suffix after deletion
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString(),
        rowCount: lines.length - 1,
        url: blob.url,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: String(error) },
      { status: 500 }
    );
  }
}