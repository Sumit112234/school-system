import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'image';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['application/pdf', 'application/msword'];

    let allowedTypes = allowedImageTypes;
    if (type === 'document' || type === 'material') {
      allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 50MB)' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine folder based on type
    const folderMap = {
      avatar: 'school-management/avatars',
      document: 'school-management/documents',
      material: 'school-management/materials',
      assignment: 'school-management/assignments'
    };

    const folder = folderMap[type] || 'school-management';

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
