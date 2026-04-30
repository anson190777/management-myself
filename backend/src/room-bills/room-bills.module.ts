import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomBillsController } from './room-bills.controller';
import { RoomBillsService } from './room-bills.service';
import { Room, RoomSchema } from '../rooms/schemas/room.schema';
import { RoomBill, RoomBillSchema } from './schemas/room-bill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomBill.name, schema: RoomBillSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  controllers: [RoomBillsController],
  providers: [RoomBillsService],
})
export class RoomBillsModule {}
