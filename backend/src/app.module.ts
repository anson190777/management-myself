import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { RoomBillsModule } from './room-bills/room-bills.module';
import { AccountBankModule } from './account-bank/account-bank.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/management_myself',
      }),
    }),
    RoomsModule,
    RoomBillsModule,
    AccountBankModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
