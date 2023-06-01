import { Injectable, Inject } from '@nestjs/common';
import { AppWebsocketGateway, EVENT_NAME } from './websocket.gateway';

@Injectable()
export class AppWebSocketService {
  constructor(
    @Inject(AppWebsocketGateway) private readonly gateway: AppWebsocketGateway,
  ) {}
  sendToAll(eventName: EVENT_NAME, message: any) {
    this.gateway.sendToAll(eventName, message);
  }
}
