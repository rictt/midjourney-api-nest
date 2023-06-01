import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, AddDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/register')
  register(@Body() registerDto: CreateUserDto) {
    return this.userService.register(registerDto);
  }

  @Post('/login')
  login(@Body() loginDto: CreateUserDto) {
    return this.userService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.getUserInfo(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  addTimes(@Body() addDto: AddDto) {
    return this.userService.addTimes(addDto.username, addDto.times);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/minus')
  minusTimes(@Body() addDto: AddDto) {
    return this.userService.minusTimes(addDto.username, addDto.times);
  }
}
