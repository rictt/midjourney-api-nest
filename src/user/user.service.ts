import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/logical/auth/auth.service';
import { encryPassword } from 'src/utils/crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async validUser(username: string, password: string) {
    console.log('[jwt step 2]: 校验用户信息');
    const user = await this.findOneByUserName(username);
    if (!user) {
      throw new InternalServerErrorException('用户不存在');
    }
    const hashPassword = encryPassword(password);
    if (user.password !== hashPassword) {
      throw new InternalServerErrorException('密码不正确');
    }
    console.log(user);
    return user;
  }

  async login(loginDto: CreateUserDto) {
    console.log('[jwt step 1]:用户请求登录');
    const userInfo = await this.validUser(loginDto.username, loginDto.password);
    const token = await this.authService.certificate(userInfo);
    delete userInfo.password;
    return {
      token,
      ...userInfo,
    };
  }

  // 需要经过token鉴权
  async getUserInfo(id: number) {
    console.log('id: ', id);
    const userInfo = await this.userRepository.findOneBy({
      id,
    });
    if (!userInfo) {
      throw new NotFoundException();
    }
    return userInfo;
  }

  async register(createUserDto: CreateUserDto) {
    const isExisted = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    if (isExisted) {
      throw new InternalServerErrorException('账号已存在');
    }
    createUserDto.createTime = new Date();
    await this.userRepository.save({
      ...createUserDto,
      password: encryPassword(createUserDto.password),
    });
    return '';
  }

  async findOneByUserName(username: string) {
    const user = await this.userRepository.findOneBy({
      username,
    });
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  async addTimes(username: string, times: number) {
    const user = await this.findOneByUserName(username);
    if (user) {
      await this.userRepository.update(
        {
          username,
        },
        {
          times: user.times + times,
        },
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  async minusTimes(username: string, times: number) {
    const user = await this.findOneByUserName(username);
    if (user) {
      await this.userRepository.update(
        {
          username,
        },
        {
          times: user.times - times,
        },
      );
    }
  }
}
