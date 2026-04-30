import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountBankDocument = HydratedDocument<AccountBank>;

@Schema({ timestamps: true, versionKey: false })
export class AccountBank {
  @Prop({ required: true, trim: true })
  customerCode: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, trim: true })
  bank: string;

  @Prop({ required: true, trim: true })
  accountNumber: string;

  @Prop({ required: true, default: false })
  isDefault: boolean;
}

export const AccountBankSchema = SchemaFactory.createForClass(AccountBank);
AccountBankSchema.index(
  { isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } },
);
