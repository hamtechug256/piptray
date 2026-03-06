import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
        provider: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            tier: true,
            winRate: true,
            totalSignals: true,
            subscribers: true,
            isVerified: true,
            isActive: true,
            averageRating: true,
          },
        },
        subscriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            plan: true,
            amount: true,
            startDate: true,
            endDate: true,
            provider: { select: { displayName: true } },
          },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            provider: { select: { displayName: true } },
          },
        },
        _count: {
          select: {
            subscriptions: true,
            payments: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, name, emailVerified } = body;

    const updateData: Record<string, unknown> = {};
    
    if (role) updateData.role = role;
    if (name !== undefined) updateData.name = name;
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified;
      if (emailVerified) {
        updateData.emailVerifiedAt = new Date();
      }
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
