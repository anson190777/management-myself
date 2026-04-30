import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true, versionKey: false })
export class Room {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  nameUser: string;

  @Prop({ required: true, min: 0 })
  monthlyRent: number;

  @Prop({ required: true, min: 0 })
  electricityUnitPrice: number;

  @Prop({ required: true, min: 0 })
  waterUnitPrice: number;

  @Prop({ required: true, min: 0 })
  wifiFee: number;

  @Prop({ required: true, min: 0 })
  trashFee: number;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
