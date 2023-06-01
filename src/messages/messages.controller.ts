import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { isProfane } from 'src/utils/bad-words';
import { BaiduService } from 'src/common/services/baidu.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly baiduService: BaiduService,
  ) {}

  @Get('/baidu')
  async testTranslate(@Query() queries: any) {
    const { text } = queries;
    return await this.baiduService.translateZH(text);
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    if (isProfane(createMessageDto.prompt)) {
      throw new HttpException(
        '请勿输入敏感词汇，否则将严禁使用',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.messagesService.create(createMessageDto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() queryMessageDto: QueryMessageDto) {
    return this.messagesService.findAll(queryMessageDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }

  @Post('/countWait')
  getWaitList(@Body() body: any) {
    return this.messagesService.getWaitListLength(body.username);
  }
}
