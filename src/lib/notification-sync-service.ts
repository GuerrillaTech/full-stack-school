import { PrismaClient } from '@prisma/client';
import { WebSocket } from 'ws';
import * as Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export enum SyncPlatform {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  EMAIL = 'EMAIL'
}

export interface NotificationSyncPayload {
  id: string;
  userId: string;
  platform: SyncPlatform;
  deviceId: string;
  notificationIds: string[];
  syncTimestamp: number;
  syncType: 'FULL' | 'PARTIAL';
}

export class NotificationSyncService {
  private prisma: PrismaClient;
  private redis: Redis.Redis;
  private websocketServer: WebSocket.Server;

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    });

    // Initialize WebSocket server for real-time sync
    this.websocketServer = new WebSocket.Server({ 
      port: parseInt(process.env.SYNC_WEBSOCKET_PORT || '8081') 
    });

    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.websocketServer.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message: string) => {
        const payload: NotificationSyncPayload = JSON.parse(message);
        
        switch (payload.syncType) {
          case 'FULL':
            await this.performFullSync(payload);
            break;
          case 'PARTIAL':
            await this.performPartialSync(payload);
            break;
        }
      });
    });
  }

  private async performFullSync(payload: NotificationSyncPayload) {
    try {
      // Retrieve all unread notifications for the user
      const unreadNotifications = await this.prisma.notification.findMany({
        where: { 
          recipientId: payload.userId,
          readAt: null
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to prevent overwhelming sync
      });

      // Store sync state in Redis for persistence
      await this.storeSyncState(payload, unreadNotifications);

      // Broadcast sync result
      this.broadcastSyncResult(payload.deviceId, {
        status: 'SUCCESS',
        notificationCount: unreadNotifications.length
      });
    } catch (error) {
      this.broadcastSyncResult(payload.deviceId, {
        status: 'ERROR',
        error: error.message
      });
    }
  }

  private async performPartialSync(payload: NotificationSyncPayload) {
    try {
      // Sync specific notifications
      const syncedNotifications = await this.prisma.notification.findMany({
        where: { 
          id: { in: payload.notificationIds },
          recipientId: payload.userId
        }
      });

      // Update sync state in Redis
      await this.updateSyncState(payload, syncedNotifications);

      this.broadcastSyncResult(payload.deviceId, {
        status: 'SUCCESS',
        notificationCount: syncedNotifications.length
      });
    } catch (error) {
      this.broadcastSyncResult(payload.deviceId, {
        status: 'ERROR',
        error: error.message
      });
    }
  }

  private async storeSyncState(
    payload: NotificationSyncPayload, 
    notifications: any[]
  ) {
    const syncStateKey = `notification_sync:${payload.userId}:${payload.deviceId}`;
    
    await this.redis.set(syncStateKey, JSON.stringify({
      syncTimestamp: payload.syncTimestamp,
      platform: payload.platform,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        createdAt: n.createdAt
      }))
    }));

    // Set expiration to prevent stale data
    await this.redis.expire(syncStateKey, 24 * 60 * 60); // 24 hours
  }

  private async updateSyncState(
    payload: NotificationSyncPayload, 
    notifications: any[]
  ) {
    const syncStateKey = `notification_sync:${payload.userId}:${payload.deviceId}`;
    
    // Retrieve existing sync state
    const existingState = await this.redis.get(syncStateKey);
    
    if (existingState) {
      const parsedState = JSON.parse(existingState);
      
      // Merge new notifications
      const mergedNotifications = [
        ...parsedState.notifications,
        ...notifications.map(n => ({
          id: n.id,
          title: n.title,
          createdAt: n.createdAt
        }))
      ];

      // Update Redis with merged state
      await this.redis.set(syncStateKey, JSON.stringify({
        ...parsedState,
        syncTimestamp: payload.syncTimestamp,
        notifications: mergedNotifications
      }));
    }
  }

  // Cross-Platform Notification Mark as Read
  async markNotificationsAsRead(
    userId: string, 
    notificationIds: string[]
  ) {
    // Mark notifications as read across all platforms
    await this.prisma.notification.updateMany({
      where: { 
        id: { in: notificationIds },
        recipientId: userId 
      },
      data: { readAt: new Date() }
    });

    // Broadcast read status to all connected devices
    this.broadcastReadStatus(userId, notificationIds);
  }

  private broadcastSyncResult(
    deviceId: string, 
    result: { 
      status: 'SUCCESS' | 'ERROR', 
      notificationCount?: number,
      error?: string 
    }
  ) {
    // Find and send sync result to specific device
    const deviceConnections = this.getDeviceConnections(deviceId);
    
    deviceConnections.forEach(connection => {
      connection.send(JSON.stringify({
        type: 'SYNC_RESULT',
        ...result
      }));
    });
  }

  private broadcastReadStatus(
    userId: string, 
    notificationIds: string[]
  ) {
    // Broadcast read status to all user's devices
    const userConnections = this.getUserConnections(userId);
    
    userConnections.forEach(connection => {
      connection.send(JSON.stringify({
        type: 'NOTIFICATIONS_READ',
        notificationIds
      }));
    });
  }

  private getDeviceConnections(deviceId: string): WebSocket[] {
    // Retrieve WebSocket connections for a specific device
    // Implement device connection tracking mechanism
    return [];
  }

  private getUserConnections(userId: string): WebSocket[] {
    // Retrieve all WebSocket connections for a user
    // Implement user connection tracking mechanism
    return [];
  }

  // Cleanup and Maintenance Methods
  async cleanupStaleNotifications() {
    // Remove notifications older than 30 days
    await this.prisma.notification.deleteMany({
      where: {
        readAt: { not: null },
        createdAt: { 
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      }
    });

    // Clear old sync states in Redis
    const keys = await this.redis.keys('notification_sync:*');
    for (const key of keys) {
      await this.redis.del(key);
    }
  }

  // Periodic sync state validation
  async validateSyncStates() {
    const syncKeys = await this.redis.keys('notification_sync:*');
    
    for (const key of syncKeys) {
      const syncState = await this.redis.get(key);
      
      if (syncState) {
        const parsedState = JSON.parse(syncState);
        
        // Check for stale or inconsistent sync states
        if (this.isSyncStateStale(parsedState)) {
          await this.redis.del(key);
        }
      }
    }
  }

  private isSyncStateStale(syncState: any): boolean {
    const MAX_SYNC_AGE = 48 * 60 * 60 * 1000; // 48 hours
    return (Date.now() - syncState.syncTimestamp) > MAX_SYNC_AGE;
  }
}
