import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MessagesService } from 'src/messages/messages.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly redisService: RedisService,
    private readonly msgService: MessagesService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  // @Cron('45 * * * * *')
  // async handleCron() {
  //   this.logger.debug('called when the current second is 45');
  // }

  // 每天凌晨12点执行，清空ip的使用记录redis
  // 清空过期的消息记录
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleClearUseIPList() {
    await this.redisService.redisClient.del(this.redisService.ipStoreName);

    const updateCount = await this.msgService.findExpiredMessagesCount();
    this.logger.log('Expired Count: ', updateCount);
    await this.msgService.findExpiredMessagesAndUpdate();
  }
}
