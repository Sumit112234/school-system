import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

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

    const profile = await User.findById(user._id).select('-password');

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { name, phone, address, city, avatar } = await req.json();

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
