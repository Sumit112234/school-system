import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Message } from '@/lib/models';

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
    const recipientId = searchParams.get('recipientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: user._id, recipientId },
        { senderId: recipientId, recipientId: user._id }
      ]
    })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { senderId: user._id, recipientId },
        { senderId: recipientId, recipientId: user._id }
      ]
    });

    return NextResponse.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { recipientId, message } = await req.json();

    if (!recipientId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newMessage = new Message({
      senderId: user._id,
      recipientId,
      message,
      createdAt: new Date()
    });

    await newMessage.save();

    const populated = await newMessage.populate('senderId', 'name avatar');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
