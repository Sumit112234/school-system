import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';

export async function POST(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'helper') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(params.id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    ticket.replies.push({
      repliedBy: user._id,
      message,
      createdAt: new Date()
    });

    await ticket.save();

    const updated = await Ticket.findById(params.id)
      .populate('replies.repliedBy', 'name role');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Add reply error:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
