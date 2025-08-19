import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('getUserInfo')
  getUserInfo() {
    return this.appService.getUserInfo();
  }

  @Post('getSstList')
  getSstList(@Body() body: any, @Headers() headers: any) {
    //模拟异常
    // throw new HttpException(
    //   {
    //     msg: '获取SST列表异常',
    //     code: 401,
    //   },
    //   401,
    // );
    return this.appService.getSstList();
  }
}
