import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.EXPECTATION_FAILED;
    const message =
      (exception && typeof exception === 'object' && exception?.message) ||
      '内部服务错误';

    const rpsBody = {
      code: status,
      message,
      requestTime: Date.now(),
      path: request.url,
    };

    response.status(HttpStatus.OK);
    response.send(rpsBody);
  }
}
