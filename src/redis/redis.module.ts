import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

type RedisModuleForRoot = {
  isGlobal?: boolean;
};

@Module({
  providers: [RedisService, ConfigService],
  exports: [RedisService],
})
export class RedisModule {
  static forRoot(ops: RedisModuleForRoot = {}): DynamicModule {
    const redisClientProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = await createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        await client.connect();
        return client;
      },
    };
    return {
      global: ops.isGlobal,
      module: RedisModule,
      providers: [redisClientProvider],
      exports: [redisClientProvider],
    };
  }
}
