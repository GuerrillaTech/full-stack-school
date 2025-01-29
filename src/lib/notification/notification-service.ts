import { PrismaClient } from '@prisma/client';
import logger from '../logger';
import { AppError } from '../error-handler';

export class NotificationService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  // Create a new notification
  async createNotification(data: {
    userId: string;
    type: 'SYSTEM' | 'LEARNING' | 'ACADEMIC' | 'PERFORMANCE' | 'SCHOLARSHIP' | 'INTERVENTION' | 'RECOMMENDATION' | 'COLLABORATION';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          ...data,
          priority: data.priority || 'MEDIUM',
        },
      });

      logger.info('Notification created', {
        userId: data.userId,
        type: data.type,
        title: data.title,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error, data });
      throw new AppError('Failed to create notification', 500);
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: string;
  }) {
    try {
      const { 
        limit = 10, 
        offset = 0, 
        unreadOnly = false,
        type 
      } = options || {};

      const whereCondition: any = { userId };
      if (unreadOnly) whereCondition.isRead = false;
      if (type) whereCondition.type = type;

      const notifications = await this.prisma.notification.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      logger.error('Failed to retrieve notifications', { error, userId });
      throw new AppError('Failed to retrieve notifications', 500);
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(notificationIds: string[]) {
    try {
      const updatedNotifications = await this.prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { isRead: true },
      });

      logger.info('Notifications marked as read', { 
        notificationIds, 
        updatedCount: updatedNotifications.count 
      });

      return updatedNotifications;
    } catch (error) {
      logger.error('Failed to mark notifications as read', { error, notificationIds });
      throw new AppError('Failed to mark notifications as read', 500);
    }
  }

  // Delete old notifications
  async deleteOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedNotifications = await this.prisma.notification.deleteMany({
        where: { 
          createdAt: { lt: cutoffDate },
          isRead: true 
        },
      });

      logger.info('Old notifications deleted', { 
        daysOld, 
        deletedCount: deletedNotifications.count 
      });

      return deletedNotifications;
    } catch (error) {
      logger.error('Failed to delete old notifications', { error, daysOld });
      throw new AppError('Failed to delete old notifications', 500);
    }
  }

  // Send real-time notification (placeholder for WebSocket/Push Notification integration)
  async sendRealTimeNotification(userId: string, notification: any) {
    // TODO: Implement WebSocket or Push Notification logic
    logger.info('Real-time notification triggered', { userId, notification });
  }
}

export default new NotificationService();
