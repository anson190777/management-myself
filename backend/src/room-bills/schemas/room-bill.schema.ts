import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Room } from '../../rooms/schemas/room.schema';

export type RoomBillDocument = HydratedDocument<RoomBill>;

@Schema({ _id: false, versionKey: false })
export class OtherFee {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  amount: number;
}

const OtherFeeSchema = SchemaFactory.createForClass(OtherFee);

@Schema({ timestamps: true, versionKey: false })
export class RoomBill {
  @Prop({ type: Types.ObjectId, ref: Room.name, required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({ required: true, match: /^\d{4}-\d{2}$/ })
  billingMonth: string;

  @Prop({ required: true, min: 0 })
  electricityOldReading: number;

  @Prop({ required: true, min: 0 })
  electricityNewReading: number;

  @Prop({ required: true, min: 0 })
  electricityUsed: number;

  @Prop({ required: true, min: 0 })
  waterOldReading: number;

  @Prop({ required: true, min: 0 })
  waterNewReading: number;

  @Prop({ required: true, min: 0 })
  waterUsed: number;

  @Prop({ required: true, min: 0 })
  electricityAmount: number;

  @Prop({ required: true, min: 0 })
  waterAmount: number;

  @Prop({ required: true, min: 0 })
  wifiFee: number;

  @Prop({ required: true, min: 0 })
  trashFee: number;

  @Prop({ required: true, min: 0 })
  monthlyRent: number;

  @Prop({ type: [OtherFeeSchema], default: [] })
  otherFees: OtherFee[];

  @Prop({ default: '' })
  note: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;
}

export const RoomBillSchema = SchemaFactory.createForClass(RoomBill);
RoomBillSchema.index({ roomId: 1, billingMonth: 1 }, { unique: true });
