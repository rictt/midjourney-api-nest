import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageStatus, Messages } from './entities/messages.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly msgRepository: Repository<Messages>,
  ) {}
  async create(createMessageDto: CreateMessageDto) {
    createMessageDto.createTime = createMessageDto.updateTime = new Date();
    const result = await this.msgRepository.save(createMessageDto);
    return result.id;
  }

  async findAll(queryMessageDto?: QueryMessageDto) {
    if (
      !queryMessageDto ||
      !queryMessageDto.pageNum ||
      !queryMessageDto.pageSize
    ) {
      queryMessageDto = {
        pageNum: 1,
        pageSize: 5,
      };
    }
    if (queryMessageDto.pageSize > 20) {
      return [];
    }
    return await this.msgRepository.find({
      skip: (queryMessageDto.pageNum - 1) * queryMessageDto.pageSize,
      take: queryMessageDto.pageSize,
      order: {
        updateTime: 'DESC',
      },
      where: {
        creator: queryMessageDto.username,
      },
    });
  }

  async getWaitListLength(username: string) {
    const count = await this.msgRepository.countBy({
      creator: username,
      status: MessageStatus.INIT,
    });
    return count;
  }

  async findOne(id: number) {
    return await this.msgRepository.findOneBy({ id });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    updateMessageDto.updateTime = new Date();
    return await this.msgRepository.update(id, updateMessageDto);
  }

  async remove(id: number) {
    return await this.msgRepository.delete(id);
  }

  async findExpiredMessagesAndUpdate() {
    // https://typeorm.bootcss.com/select-query-builder
    const currentTime = new Date();
    // 超过30分钟
    const expiredTime = new Date(currentTime.getTime() - 30 * 60 * 1000);
    await this.msgRepository
      .createQueryBuilder()
      .update({ status: MessageStatus.TIMEOUT, updateTime: new Date() })
      .where('status = :status', { status: MessageStatus.INIT })
      .andWhere('createTime <= :createTime', { createTime: expiredTime })
      .execute();
  }

  async findExpiredMessagesCount() {
    const currentTime = new Date();
    // 超过30分钟
    const expiredTime = new Date(currentTime.getTime() - 30 * 60 * 1000);
    return await this.msgRepository
      .createQueryBuilder()
      .select()
      .where('status = :status', { status: MessageStatus.INIT })
      .andWhere('createTime <= :createTime', { createTime: expiredTime })
      .getCount();
  }
}
