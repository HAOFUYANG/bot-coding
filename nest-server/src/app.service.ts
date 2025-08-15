import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUserInfo() {
    return {
      msg: 'success',
      code: 0,
      data: {
        username: 'haofuyang',
        session: 'local-session-id-123456',
      },
    };
  }
}
