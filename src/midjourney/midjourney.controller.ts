import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { CreateApiDto, UpscaleDto } from './dto/index.dto';
import { isProfane } from 'src/utils/bad-words';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

@Controller('mj')
export class MidjourneyController {
  constructor(
    private readonly mjService: MidjourneyService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  @Post('/upscale')
  async upscale(@Body() upscaleDto: UpscaleDto, @Headers() headers) {
    if (isProfane(upscaleDto.prompt)) {
      throw new HttpException(
        '请勿输入敏感词汇，否则将严禁使用',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.mjService.upScaleAPI(upscaleDto, headers);
  }

  @Post('/imagine')
  async create(
    @Body() createApiDto: CreateApiDto,
    @Headers() headers,
    @Headers('x-real-ip') headerRealIP: string,
  ) {
    if (isProfane(createApiDto.prompt)) {
      throw new HttpException(
        '请勿输入敏感词汇，否则将严禁使用',
        HttpStatus.BAD_REQUEST,
      );
    }
    // headerRealIP = '127.0.0.3';
    console.log('[REAL IP ADDRESS]: ', headerRealIP);

    if (
      this.configService.get('APP_ENV') === 'production' &&
      !headers['username']
    ) {
      if (!headerRealIP) {
        throw new HttpException('错误请求', HttpStatus.FORBIDDEN);
      }
      const count = await this.redisService.getIpUse(headerRealIP);
      console.log('[ADDRESS USE COUNT]: ', count);
      if (count >= 2) {
        throw new HttpException('今日免费次数已用完', HttpStatus.FORBIDDEN);
      }
    }

    return await this.mjService.imagineAPI(createApiDto, headers);
  }
}
