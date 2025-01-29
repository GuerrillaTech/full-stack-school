import { PrismaClient } from '@prisma/client';
import { WebSocket } from 'ws';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { OpenAI } from 'openai';

export class NotificationService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private websocketServer: WebSocket.Server;
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });

    // Email Configuration
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Twilio SMS Configuration
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );

    // WebSocket Server for Real-Time Notifications
    this.websocketServer = new WebSocket.Server({ 
      port: parseInt(process.env.WEBSOCKET_PORT || '8080') 
    });

    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.websocketServer.on('connection', (ws: WebSocket) => {
      ws.on('message', async (message: string) => {
        const parsedMessage = JSON.parse(message);
        
        // Handle authentication and notification preferences
        if (parsedMessage.type === 'authenticate') {
          await this.authenticateWebSocket(ws, parsedMessage.token);
        }
      });
    });
  }

  private async authenticateWebSocket(
    ws: WebSocket, 
    token: string
  ) {
    try {
      // Implement token validation logic
      const user = await this.validateUserToken(token);
      
      // Store WebSocket connection with user
      this.storeWebSocketConnection(user.id, ws);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication failed'
      }));
    }
  }

  private async validateUserToken(token: string) {
    // Implement secure token validation
    // This is a placeholder - replace with actual authentication logic
    return await this.prisma.user.findUnique({
      where: { authToken: token }
    });
  }

  private storeWebSocketConnection(
    userId: string, 
    ws: WebSocket
  ) {
    // Store WebSocket connection for real-time notifications
    // Implement connection management logic
  }

  async sendNotification(
    userId: string, 
    notificationData: {
      title: string;
      body: string;
      category: string;
      priority?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }
  ) {
    // Retrieve user's notification preferences
    const userPreferences = await this.prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!userPreferences || !userPreferences.consentGiven) {
      return null;
    }

    // Check quiet hours
    if (this.isQuietHours(userPreferences)) {
      return null;
    }

    // AI-Enhanced Notification Personalization
    const personalizedNotification = await this.personalizeNotification(
      notificationData
    );

    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: userId,
        title: personalizedNotification.title,
        body: personalizedNotification.body,
        category: notificationData.category as any,
        priority: notificationData.priority as any || 'MEDIUM',
        relatedEntityType: notificationData.relatedEntityType,
        relatedEntityId: notificationData.relatedEntityId,
        aiGeneratedInsights: personalizedNotification.insights
      }
    });

    // Determine delivery channels based on user preferences
    const deliveryChannels = this.determineDeliveryChannels(userPreferences);

    // Send notifications via selected channels
    await Promise.all(deliveryChannels.map(async (channel) => {
      switch (channel) {
        case 'EMAIL':
          await this.sendEmailNotification(userId, notification);
          break;
        case 'SMS':
          await this.sendSmsNotification(userId, notification);
          break;
        case 'PUSH':
          await this.sendPushNotification(userId, notification);
          break;
        case 'IN_APP':
          await this.sendInAppNotification(userId, notification);
          break;
      }
    }));

    return notification;
  }

  private async personalizeNotification(notificationData: any) {
    const personalizedPrompt = `
      Personalize notification:
      - Title: ${notificationData.title}
      - Body: ${notificationData.body}
      - Category: ${notificationData.category}

      Generate:
      - More engaging title
      - Personalized message
      - Contextual insights
    `;

    const aiResponse = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert notification personalization AI.'
        },
        {
          role: 'user',
          content: personalizedPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512
    });

    const personalizedContent = JSON.parse(
      aiResponse.choices[0].message.content || '{}'
    );

    return {
      title: personalizedContent.title || notificationData.title,
      body: personalizedContent.body || notificationData.body,
      insights: personalizedContent
    };
  }

  private determineDeliveryChannels(
    preferences: NotificationPreference
  ): NotificationType[] {
    const channels: NotificationType[] = [];

    if (preferences.enableEmailNotifications) 
      channels.push('EMAIL');
    if (preferences.enableSmsNotifications) 
      channels.push('SMS');
    if (preferences.enablePushNotifications) 
      channels.push('PUSH');
    if (preferences.enableInAppNotifications) 
      channels.push('IN_APP');

    return channels;
  }

  private isQuietHours(
    preferences: NotificationPreference
  ): boolean {
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const quietStart = new Date(preferences.quietHoursStart);
    const quietEnd = new Date(preferences.quietHoursEnd);

    return now >= quietStart && now <= quietEnd;
  }

  private async sendEmailNotification(
    userId: string, 
    notification: Notification
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.email) return;

    await this.emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: notification.title,
      html: `
        <h1>${notification.title}</h1>
        <p>${notification.body}</p>
      `
    });

    await this.updateNotificationStatus(
      notification.id, 
      'SENT', 
      ['EMAIL']
    );
  }

  private async sendSmsNotification(
    userId: string, 
    notification: Notification
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.phoneNumber) return;

    await this.twilioClient.messages.create({
      body: `${notification.title}: ${notification.body}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber
    });

    await this.updateNotificationStatus(
      notification.id, 
      'SENT', 
      ['SMS']
    );
  }

  private async sendPushNotification(
    userId: string, 
    notification: Notification
  ) {
    // Implement push notification logic
    // This would typically use services like Firebase Cloud Messaging
  }

  private async sendInAppNotification(
    userId: string, 
    notification: Notification
  ) {
    // Send via WebSocket to connected clients
    const userConnections = this.getUserWebSocketConnections(userId);
    
    userConnections.forEach(connection => {
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    });
  }

  private getUserWebSocketConnections(userId: string): WebSocket[] {
    // Retrieve and return active WebSocket connections for a user
    // Implement connection tracking mechanism
    return [];
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationDeliveryStatus,
    channels: NotificationType[]
  ) {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { 
        deliveryStatus: status,
        channels: channels,
        sentAt: new Date()
      }
    });
  }

  // Advanced Notification Routing Algorithm
  async advancedNotificationRouting(
    notification: {
      recipientId: string;
      category: NotificationCategory;
      priority: NotificationPriority;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }
  ) {
    // Retrieve user's notification preferences and profile
    const userProfile = await this.prisma.user.findUnique({
      where: { id: notification.recipientId },
      include: {
        notificationPreferences: true,
        learningProfile: true,
        roles: true
      }
    });

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // AI-Enhanced Routing Decision
    const routingDecisionPrompt = `
      Advanced Notification Routing Analysis:
      
      User Context:
      - Roles: ${userProfile.roles.map(r => r.name).join(', ')}
      - Learning Profile: ${JSON.stringify(userProfile.learningProfile)}
      
      Notification Details:
      - Category: ${notification.category}
      - Priority: ${notification.priority}
      - Related Entity: ${notification.relatedEntityType}
      
      Determine:
      - Optimal delivery channels
      - Personalization strategy
      - Routing priority
      - Potential engagement impact
    `;

    const aiRoutingDecision = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert notification routing strategist.'
        },
        {
          role: 'user',
          content: routingDecisionPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 512
    });

    const routingInsights = JSON.parse(
      aiRoutingDecision.choices[0].message.content || '{}'
    );

    // Dynamic Channel Selection
    const selectedChannels = this.selectOptimalChannels(
      userProfile.notificationPreferences, 
      routingInsights
    );

    // Priority-Based Routing
    const routingPriority = this.determineRoutingPriority(
      notification.priority, 
      routingInsights
    );

    // Create Routed Notification
    const routedNotification = await this.prisma.notification.create({
      data: {
        ...notification,
        type: selectedChannels[0], // Primary channel
        channels: selectedChannels,
        aiGeneratedInsights: {
          routingStrategy: routingInsights,
          priority: routingPriority
        }
      }
    });

    // Dispatch Notifications
    await this.dispatchNotificationByRouting(
      routedNotification, 
      selectedChannels, 
      routingPriority
    );

    return routedNotification;
  }

  private selectOptimalChannels(
    preferences: NotificationPreference, 
    routingInsights: any
): NotificationType[] {
  const channelPriority: NotificationType[] = [
    'IN_APP',   // Always prioritize in-app
    'EMAIL',    // Formal communication
    'PUSH',     // Quick updates
    'SMS'       // Critical alerts
  ];

  // Filter based on user preferences and AI insights
  return channelPriority.filter(channel => {
    const channelEnabled = {
      'IN_APP': preferences.enableInAppNotifications,
      'EMAIL': preferences.enableEmailNotifications,
      'PUSH': preferences.enablePushNotifications,
      'SMS': preferences.enableSmsNotifications
    }[channel];

    const aiChannelRecommendation = 
      routingInsights.recommendedChannels?.includes(channel);

    return channelEnabled && 
           (aiChannelRecommendation || Math.random() < 0.7);
  }).slice(0, 2); // Limit to top 2 channels
}

  private determineRoutingPriority(
    basePriority: NotificationPriority, 
    routingInsights: any
): 'IMMEDIATE' | 'BATCHED' | 'DELAYED' {
  const priorityMap = {
    'LOW': 'BATCHED',
    'MEDIUM': 'BATCHED',
    'HIGH': 'IMMEDIATE',
    'CRITICAL': 'IMMEDIATE'
  };

  const aiPriorityRecommendation = 
    routingInsights.recommendedPriority;

  return aiPriorityRecommendation || 
         priorityMap[basePriority] || 
         'BATCHED';
}

  private async dispatchNotificationByRouting(
    notification: Notification,
    channels: NotificationType[],
    routingPriority: 'IMMEDIATE' | 'BATCHED' | 'DELAYED'
  ) {
    switch (routingPriority) {
      case 'IMMEDIATE':
        await Promise.all(
          channels.map(channel => this.sendNotificationByChannel(
            notification, 
            channel
          ))
        );
        break;
      
      case 'BATCHED':
        // Queue for next batch processing
        await this.queueNotificationForBatchProcessing(
          notification, 
          channels
        );
        break;
      
      case 'DELAYED':
        // Schedule for later processing
        await this.scheduleNotificationDelivery(
          notification, 
          channels
        );
        break;
    }
  }

  private async sendNotificationByChannel(
    notification: Notification,
    channel: NotificationType
  ) {
    switch (channel) {
      case 'IN_APP':
        await this.sendInAppNotification(
          notification.recipientId, 
          notification
        );
        break;
      case 'EMAIL':
        await this.sendEmailNotification(
          notification.recipientId, 
          notification
        );
        break;
      case 'PUSH':
        await this.sendPushNotification(
          notification.recipientId, 
          notification
        );
        break;
      case 'SMS':
        await this.sendSmsNotification(
          notification.recipientId, 
          notification
        );
        break;
    }
  }

  private async queueNotificationForBatchProcessing(
    notification: Notification,
    channels: NotificationType[]
  ) {
    // Implement batch notification queuing logic
    // Could use a message queue like Redis or RabbitMQ
  }

  private async scheduleNotificationDelivery(
    notification: Notification,
    channels: NotificationType[]
  ) {
    // Implement scheduled notification delivery
    // Could use a job scheduling system like Bull or Agenda
  }

  // Notification Preferences Management
  async updateNotificationPreferences(
    userId: string,
    preferences: {
      enableEmailNotifications?: boolean;
      enableSmsNotifications?: boolean;
      enablePushNotifications?: boolean;
      enableInAppNotifications?: boolean;
      scholarshipNotifications?: boolean;
      apprenticeshipNotifications?: boolean;
      academicUpdateNotifications?: boolean;
      performanceReviewNotifications?: boolean;
      dailyDigestEnabled?: boolean;
      weeklyDigestEnabled?: boolean;
      quietHoursStart?: Date;
      quietHoursEnd?: Date;
    }
  ) {
    return await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });
  }

  // Digest Notification Generation
  async generateDigestNotifications() {
    const users = await this.prisma.user.findMany({
      include: {
        notificationPreferences: true
      }
    });

    for (const user of users) {
      if (!user.notificationPreferences) continue;

      if (user.notificationPreferences.dailyDigestEnabled) {
        await this.sendDailyDigest(user.id);
      }

      if (user.notificationPreferences.weeklyDigestEnabled) {
        await this.sendWeeklyDigest(user.id);
      }
    }
  }

  private async sendDailyDigest(userId: string) {
    // Implement daily digest notification logic
  }

  private async sendWeeklyDigest(userId: string) {
    // Implement weekly digest notification logic
  }
}
