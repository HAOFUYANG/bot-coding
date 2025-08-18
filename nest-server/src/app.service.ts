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
        admin: true,
      },
    };
  }
  getSstList() {
    return {
      msg: 'success',
      code: 0,
      data: [
        { sst: 'R1234', desc: '测试sst来自版本管理', app: 'svm' },
        { sst: 'R1111', desc: '流水线的sst', app: 'ppl' },
        { sst: 'R2222', desc: '发布管理的sst', app: 'lotus' },
      ],
    };
  }
}
