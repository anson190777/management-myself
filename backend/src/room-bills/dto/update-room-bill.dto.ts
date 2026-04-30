import { PartialType } from '@nestjs/swagger';
import { CreateRoomBillDto } from './create-room-bill.dto';

export class UpdateRoomBillDto extends PartialType(CreateRoomBillDto) {}
