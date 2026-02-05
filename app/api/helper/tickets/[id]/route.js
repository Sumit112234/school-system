import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';

export async function GET(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'helper') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findById(params.id)
      .populate('createdBy', 'name email role')
      .populate('replies.repliedBy', 'name role');

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Fetch ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'helper') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findByIdAndDelete(params.id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ticket deleted' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
