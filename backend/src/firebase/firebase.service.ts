import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');

      if (!serviceAccount) {
        this.logger.warn('Firebase service account not configured. Push notifications will not work.');
        return;
      }

      // Parse the service account JSON
      const serviceAccountJson = JSON.parse(serviceAccount);

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendNotification(
    token: string,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<string> {
    if (!this.firebaseApp) {
      throw new Error('Firebase is not initialized');
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent notification to token: ${token.substring(0, 10)}...`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send notification to token: ${token.substring(0, 10)}...`, error);
      throw error;
    }
  }

  async sendMulticast(
    tokens: string[],
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.firebaseApp) {
      throw new Error('Firebase is not initialized');
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Successfully sent ${response.successCount} notifications out of ${tokens.length}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send multicast notification', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!this.firebaseApp) {
      return false;
    }

    try {
      // Try to send a dry-run message to verify the token
      await admin.messaging().send({
        token,
        notification: {
          title: 'Test',
          body: 'Test',
        },
      }, true); // dry run
      return true;
    } catch (error) {
      return false;
    }
  }
}
