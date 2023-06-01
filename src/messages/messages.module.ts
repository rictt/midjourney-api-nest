import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entities/messages.entity';
import { BaiduService } from 'src/common/services/baidu.service';
// import { } from 'src/websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Messages])],
  controllers: [MessagesController],
  providers: [MessagesService, BaiduService],
  exports: [MessagesService],
})
export class MessagesModule {}
