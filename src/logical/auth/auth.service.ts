import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // async validateUser(username: string, password: string) {
  //   console.log('[jwt step 2]: 校验用户信息');
  //   const user = this.userService.findOneByUserName(username);
  //   if (!user) {
  //     throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
  //   }
  //   const hashPassword = encryPassword(password);
  //   if (user.password !== hashPassword) {
  //     throw new HttpException('密码不正确', HttpStatus.BAD_REQUEST);
  //   }
  //   return user;
  // }

  async certificate(user: any) {
    console.log('[JWT step 3]: 处理 jwt 签证');
    const payload = {
      userId: user.id,
      username: user.username,
    };

    try {
      const token = this.jwtService.sign(payload);
      return token;
    } catch (error) {
      throw new HttpException('登录失败', HttpStatus.BAD_REQUEST);
    }
  }
}
