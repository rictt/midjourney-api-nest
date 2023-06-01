import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  public ipStoreName = 'IP_USE_LIST';
  // @Inject('REDIS_CLIENT')
  // public redisClient: RedisClientType;
  constructor(
    @Inject('REDIS_CLIENT') public readonly redisClient: RedisClientType,
  ) {}

  async connect() {
    await this.redisClient.connect();
  }

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async getIpUse(ipAddress: string) {
    const value = await this.redisClient.hGet(this.ipStoreName, ipAddress);
    return Number(value) || 0;
  }

  async addIpUse(ipAddress: string) {
    const value =
      Number(await this.redisClient.hGet(this.ipStoreName, ipAddress)) || 0;
    await this.updateIpHashList(ipAddress, value + 1);
  }

  async minusIpUse(ipAddress: string) {
    const value =
      Number(await this.redisClient.hGet(this.ipStoreName, ipAddress)) || 0;
    await this.updateIpHashList(ipAddress, value - 1);
  }

  async updateIpHashList(ipAddress: string, value: number) {
    await this.redisClient.hSet(this.ipStoreName, ipAddress, value);
  }
}
