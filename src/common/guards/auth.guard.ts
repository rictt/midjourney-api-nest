import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

// let useCount = 0;

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const headers = req.headers;

    // 如果有正常的用户身份字段，先鉴权
    if (headers['userno'] && headers['authorization']) {
      return super.canActivate(context);
    }

    // 如果没有再从redis判断有没有ip超限
    return true;
  }
}
