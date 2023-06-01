import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
// import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
// import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '8h',
      },
    }),
    // UserModule,
  ],
  // providers: [AuthService, LocalStrategy, JwtStrategy],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
