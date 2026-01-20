import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
    // Note: User data isolation is enforced at the service layer
    // by filtering queries based on authenticated user's ID
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected');
  }

  // Helper method to clean database (useful for testing)
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key[0] === key[0].toLowerCase(),
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof PrismaService];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      }),
    );
  }
}
