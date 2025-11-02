import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delete existing leaderboard file from Cloudinary
    try {
      await cloudinary.uploader.destroy('leaderboard', {
        resource_type: 'raw',
        invalidate: true, // Invalidate CDN cache
      });
      console.log('Deleted old leaderboard file');
    } catch (delError) {
      console.log('No existing file to delete or deletion failed:', delError);
    }

    // Upload to Cloudinary as raw file
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: 'leaderboard', // Fixed public_id
          format: 'csv',
          invalidate: true, // Invalidate CDN cache
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString(),
        rowCount: lines.length - 1,
        url: (uploadResult as any).secure_url,
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