import { Module } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { MidjourneyController } from './midjourney.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from 'src/messages/messages.module';
import { UserModule } from 'src/user/user.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { BaiduService } from 'src/common/services/baidu.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [ConfigModule, MessagesModule, UserModule, WebsocketModule],
  controllers: [MidjourneyController],
  providers: [MidjourneyService, BaiduService, ConfigService, RedisService],
  exports: [MidjourneyService],
})
export class MidjourneyModule {}
