import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notice } from '@/lib/models';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const notices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notice.countDocuments();

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch notices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { title, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notice = new Notice({
      title,
      content,
      category: category || 'general',
      createdBy: user._id,
      createdAt: new Date()
    });

    await notice.save();

    const populated = await notice.populate('createdBy', 'name');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create notice error:', error);
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}
