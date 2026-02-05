import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'helper') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'helper') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { ticketId, status } = await req.json();

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
