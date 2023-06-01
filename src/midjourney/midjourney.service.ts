import { HttpException, Injectable } from '@nestjs/common';
import { Midjourney } from 'midjourney';
import { CreateApiDto, UpscaleDto } from './dto/index.dto';
import { MessagesService } from 'src/messages/messages.service';
import { MessageStatus } from 'src/messages/entities/messages.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { ITask, taskQueueInstance } from 'src/utils/task-queue';
import { AppWebSocketService } from 'src/websocket/websocket.service';
import { EVENT_NAME } from 'src/websocket/websocket.gateway';
import { BaiduService } from 'src/common/services/baidu.service';
import { RedisService } from 'src/redis/redis.service';

const getErrorMessage = (error: any) => {
  if (error && typeof error === 'object') {
    if (error.message && typeof error.message === 'string') {
      return error.message.substring(0, 500);
    }
  }
  return JSON.stringify(error).substring(0, 500);
};

let clientInstance: Midjourney;

const config = {
  ServerId: '',
  ChannelId: '',
  SalaiToken: '',
};

export const getClientInstance = () => {
  return clientInstance;
};

export const createMidjourney = async () => {
  // if (clientInstance) return clientInstance;
  const client = await new Midjourney({
    ServerId: config.ServerId,
    ChannelId: config.ChannelId,
    SalaiToken: config.SalaiToken,
    Debug: true,
    // Ws: true,
  });
  await client.init();
  await client.Connect();
  clientInstance = client;
  return client;
};

@Injectable()
export class MidjourneyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
    private readonly appWebsocketService: AppWebSocketService,
    private readonly baiduService: BaiduService,
    private readonly redisService: RedisService,
  ) {
    const s = this.configService.get<string>('SERVER_ID');
    const c = this.configService.get<string>('CHANNEL_ID');
    const token = this.configService.get<string>('SALAI_TOKEN');
    config.ServerId = s;
    config.ChannelId = c;
    config.SalaiToken = token;
  }

  async upScaleAPI(upscaleDto: UpscaleDto, headers: Headers) {
    const { prompt, msgHash, msgId, index, flags } = upscaleDto;
    const currentId = await this.messagesService.create({
      uri: '',
      prompt,
      msgId,
      msgHash,
      index,
      creator: headers['username'] || '',
    });
    const instance = await createMidjourney();
    // getClientInstance
    instance
      .Upscale({
        content: prompt,
        index: index as 1 | 2 | 3 | 4,
        flags,
        msgId,
        hash: msgHash,
        loading: (uri: string) => {
          this.messagesService.update(currentId, {
            uri: uri,
            status: MessageStatus.START,
            updateTime: new Date(),
          });
        },
      })
      .then((msg) => {
        console.log('imagine.done', msg);
        const updateDto = {
          uri: msg.uri,
          status: MessageStatus.DONE,
          updateTime: new Date(),
          msgHash: msg.hash,
          msgId: msg.id,
        };
        this.messagesService.update(currentId, updateDto);
        this.appWebsocketService.sendToAll(EVENT_NAME.TASK_UPDATE, {
          ...updateDto,
          id: currentId,
        });
      })
      .catch((error) => {
        console.log('----[Upscale failed with]: ', error);
        let msg = getErrorMessage(error);
        let status = MessageStatus.FAILED;
        if (msg && msg.toLowerCase().indexOf('against') !== -1) {
          // 拉黑用户
          msg = '敏感词汇';
          status = MessageStatus.SENSITIVE;
        }
        this.messagesService.update(currentId, {
          status,
          remark: msg,
        });
      });
    return currentId;
  }

  async imagineAPI(createApiDto: CreateApiDto, headers: Headers) {
    const username = headers['username'] || '';
    const realIP = headers['x-real-ip'] || '';
    if (username) {
      const user = await this.userService.findOneByUserName(username);
      if (user && user.username !== 'joeytest') {
        if (user.times > 0) {
          const tasksLen = await this.messagesService.getWaitListLength(
            username,
          );
          if (tasksLen < 2) {
            await this.userService.minusTimes(username, 1);
          } else {
            throw new HttpException('当前存在2个排队任务，请稍后重试', 10000);
          }
        } else {
          throw new HttpException('绘画次数为0，请联系客服', 20000);
        }
      }
    }

    const mainText = createApiDto.prompt.split('--')[0];
    const parameters = createApiDto.prompt.split('--')[1]
      ? '--' + createApiDto.prompt.split('--')[1]
      : '';
    const translate = this.baiduService.isChinese(mainText)
      ? ((await this.baiduService.translateZH(mainText)) as string)
      : '';
    const currentId = await this.messagesService.create({
      prompt: createApiDto.prompt,
      translate: translate + parameters,
      creator: username,
    });

    if (realIP) {
      this.redisService.addIpUse(realIP);
    }

    taskQueueInstance.push(
      this.createImagineTask(
        (translate && translate + parameters) || createApiDto.prompt,
        currentId,
        username,
      ),
    );

    // taskQueueInstance.push({
    //   execute() {
    //     return new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve('');
    //       }, 500 + Math.ceil(Math.random() * 10000));
    //     });
    //   },
    // });

    return currentId;
  }

  createImagineTask(
    prompt: string,
    messageId: number,
    username: string,
  ): ITask {
    const executeFun = () => {
      console.log('回调任务执行');
      return new Promise(async (resolve) => {
        try {
          const instance = await createMidjourney();
          // getClientInstance()
          instance
            .Imagine(prompt, (uri: string) => {
              this.appWebsocketService.sendToAll(EVENT_NAME.TASK_UPDATE, {
                status: MessageStatus.START,
                uri,
                id: messageId,
              });
              this.messagesService.update(messageId, {
                status: MessageStatus.START,
                uri,
                updateTime: new Date(),
              });
            })
            .then((msg) => {
              console.log('[Imagine response]: ', msg);
              const updateDto = {
                status: MessageStatus.DONE,
                uri: msg.uri,
                msgHash: msg.hash,
                msgId: msg.id,
                flags: msg.flags,
                creator: username,
              };
              this.messagesService.update(messageId, updateDto);
              this.appWebsocketService.sendToAll(EVENT_NAME.TASK_UPDATE, {
                ...updateDto,
                id: messageId,
              });
            })
            .catch(async (error) => {
              if (username) {
                await this.userService.addTimes(username, 1);
              }
              // error是一个对象，error.message是具体错误信息
              console.log('----[Error message]: ', error.message);
              let msg = getErrorMessage(error);
              let status = MessageStatus.FAILED;
              if (msg && msg.toLowerCase().indexOf('against') !== -1) {
                // 拉黑用户
                msg = '敏感词汇';
                status = MessageStatus.SENSITIVE;
              }
              this.messagesService.update(messageId, {
                status,
                remark: msg,
              });
              this.appWebsocketService.sendToAll(EVENT_NAME.TASK_UPDATE, {
                status,
                id: messageId,
              });
            })
            .finally(() => {
              resolve(undefined);
            });
        } catch (error) {
          console.log(error);
        }
      });
    };

    const onTimeoutFun = async () => {
      if (username) {
        await this.userService.addTimes(username, 1);
      }
      this.messagesService.update(messageId, {
        status: MessageStatus.TIMEOUT,
        remark: '服务器超时',
      });
    };
    return {
      execute: executeFun,
      onTimeout: onTimeoutFun,
    };
  }
}
