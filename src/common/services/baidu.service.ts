import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

const TRANSLATE_URL = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

@Injectable()
export class BaiduService {
  private appid: string;
  private secretKey: string;
  private dev: string;
  constructor(private readonly httpService: HttpService) {
    this.appid = 'baidu app id';
    this.secretKey = 'app secret';
    this.dev = process.env.NODE_ENV;
  }
  async translateZH(text: string) {
    console.log('翻译内容: ', text);
    if (!this.isChinese(text) || this.dev !== 'production') {
      // if (!this.isChinese(text)) {
      return text;
    }
    try {
      const { salt, hash } = this.createMD5Hash(text);
      const url =
        TRANSLATE_URL +
        `?q=${text}&from=zh&to=en&appid=${this.appid}&salt=${salt}&sign=${hash}`;
      const response = await lastValueFrom(
        this.httpService
          .get(url)
          .pipe(map((data) => data?.data?.trans_result?.[0]?.dst)),
      );

      return response.toString();
    } catch (error) {
      console.log('翻译失败：', error);
    }
    return text;
  }

  isChinese(text: string) {
    const reg = /[\u4e00-\u9fa5]+/;
    return reg.test(text);
  }

  createMD5Hash(query: string) {
    const salt = this.createSalt();
    const strToHash = this.appid + query + salt + this.secretKey;
    return {
      hash: CryptoJS.MD5(strToHash).toString(),
      salt,
    };
  }

  createSalt(length = 8) {
    const chars = '1234567890';
    let salt = '';
    for (let i = 0; i < length; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }
}
