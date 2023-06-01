import { Module } from '@nestjs/common';
import { AppWebsocketGateway } from './websocket.gateway';
import { AppWebSocketService } from './websocket.service';

@Module({
  imports: [],
  exports: [AppWebsocketGateway, AppWebSocketService],
  providers: [AppWebsocketGateway, AppWebSocketService],
})
export class WebsocketModule {}
