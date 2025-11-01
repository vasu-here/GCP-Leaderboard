import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request : NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file : File = formData.get('file') as File;
    const password = formData.get('password');

    console.log(password);
    console.log(process.env.ADMIN_PASSWORD)
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

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate CSV content (basic check)
    const content = buffer.toString('utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header and one data row' },
        { status: 400 }
      );
    }

    // Expected headers
    // const expectedHeaders = [
    //   'username',
    //   'user email',
    //   'gcp email',
    //   'all skills and badges completed(Yes / No)',
    //   'number of skills badges',
    //   'names of completed skills',
    //   'number of completed arcade games',
    //   'names of it'
    // ];

    // const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    // const hasValidHeaders = expectedHeaders.every(expected => 
    //   headers.some(header => header.toLowerCase().includes(expected.toLowerCase()))
    // );

    // if (!hasValidHeaders) {
    //   return NextResponse.json(
    //     { error: 'CSV headers do not match expected format' },
    //     { status: 400 }
    //   );
    // }

    // Save file to public directory
    const filePath = path.join(process.cwd(), 'public', 'leaderboard.csv');
    await writeFile(filePath, buffer);

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString(),
        rowCount: lines.length - 1
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}