import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Ticket, User } from '@/lib/models';

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

    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const pendingTickets = await Ticket.countDocuments({ status: 'pending' });

    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    const stats = {
      totalTickets,
      openTickets,
      resolvedTickets,
      pendingTickets,
      recentTickets
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Helper dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
