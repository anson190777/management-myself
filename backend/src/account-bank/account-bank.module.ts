import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountBankController } from './account-bank.controller';
import { AccountBankService } from './account-bank.service';
import { AccountBank, AccountBankSchema } from './schemas/account-bank.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountBank.name, schema: AccountBankSchema },
    ]),
  ],
  controllers: [AccountBankController],
  providers: [AccountBankService],
})
export class AccountBankModule {}
