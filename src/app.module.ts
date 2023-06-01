import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MidjourneyModule } from './midjourney/midjourney.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './logical/auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AppWebsocketGateway } from './websocket/websocket.gateway';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './common/tasks/tasks.service';

@Module({
  imports: [
    {
      module: HttpModule,
      global: true,
    },
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService) {
        const username = configService.get('DB_USERNAME');
        const password = configService.get('DB_PASSWORD');
        const database = configService.get('DB_NAME');
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username,
          password,
          database,
          // 自己查找实体类
          autoLoadEntities: true,
          // 自动创建数据库表
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    MidjourneyModule,
    MessagesModule,
    UserModule,
    AuthModule,
    WebsocketModule,
    RedisModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AppWebsocketGateway, TasksService],
})
export class AppModule {}
