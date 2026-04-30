import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountBankDto } from './dto/create-account-bank.dto';
import {
  AccountBank,
  AccountBankDocument,
} from './schemas/account-bank.schema';

@Injectable()
export class AccountBankService {
  constructor(
    @InjectModel(AccountBank.name)
    private readonly accountBankModel: Model<AccountBankDocument>,
  ) {}

  async create(createAccountBankDto: CreateAccountBankDto) {
    if (createAccountBankDto.isDefault) {
      await this.accountBankModel.updateMany({}, { isDefault: false }).exec();
    }

    return this.accountBankModel.create({
      ...createAccountBankDto,
      isDefault: createAccountBankDto.isDefault ?? false,
    });
  }

  list() {
    return this.accountBankModel.find().sort({ createdAt: -1 }).exec();
  }

  getDefault() {
    return this.accountBankModel.findOne({ isDefault: true }).exec();
  }

  async updateDefault(id: string) {
    const existing = await this.accountBankModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Account bank not found');
    }

    await this.accountBankModel.updateMany({}, { isDefault: false }).exec();
    return this.accountBankModel
      .findByIdAndUpdate(id, { isDefault: true }, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.accountBankModel.findByIdAndDelete(id).exec();
  }
}
