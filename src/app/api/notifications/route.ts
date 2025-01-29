import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import notificationService from '@/lib/notification/notification-service';
import { asyncHandler } from '@/lib/error-handler';
import logger from '@/lib/logger';

// Get user notifications
export const GET = asyncHandler(async (req: NextRequest) => {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const type = searchParams.get('type') || undefined;

  const notifications = await notificationService.getUserNotifications(userId, {
    limit,
    offset,
    unreadOnly,
    type,
  });

  return NextResponse.json(notifications);
});

// Mark notifications as read
export const PATCH = asyncHandler(async (req: NextRequest) => {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { notificationIds } = await req.json();

  if (!Array.isArray(notificationIds)) {
    return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
  }

  const updatedNotifications = await notificationService.markNotificationsAsRead(notificationIds);

  logger.info('Notifications marked as read', { 
    userId, 
    notificationIds 
  });

  return NextResponse.json(updatedNotifications);
});

// Create a new notification (admin/system use)
export const POST = asyncHandler(async (req: NextRequest) => {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Add role-based check to ensure only admins can create system notifications
  const notificationData = await req.json();

  const notification = await notificationService.createNotification({
    ...notificationData,
    userId,
  });

  return NextResponse.json(notification, { status: 201 });
});
