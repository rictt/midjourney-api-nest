import { Bind } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export enum EVENT_NAME {
  MESSAGE = 'message',
  EVENTS = 'events',
  INIT = 'init',
  ONLINE = 'online',
  TASK_UPDATE = 'task_update',
}

@WebSocketGateway(3333, {
  cors: '*',
})
export class AppWebsocketGateway implements OnGatewayInit {
  afterInit(server: any) {
    // console.log('init !!!');
  }
  handleConnection(client: any, ...args: any[]) {
    // console.log('client connected');
  }
  @WebSocketServer() server: Server;

  @Bind(MessageBody())
  @SubscribeMessage(EVENT_NAME.INIT)
  handleMessage(client: Socket, data: any) {
    return {
      event: EVENT_NAME.ONLINE,
      data: true,
    };
  }

  @Bind(MessageBody())
  @SubscribeMessage(EVENT_NAME.MESSAGE)
  handleMessageEvent(data: any) {
    return {
      event: EVENT_NAME.MESSAGE,
      data,
    };
  }

  sendToAll(eventName: EVENT_NAME, message: string) {
    this.server.emit(eventName, message);
  }
}
