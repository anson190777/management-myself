import { ApiProperty } from '@nestjs/swagger';

export class OtherFeeResponseDto {
  @ApiProperty({ example: 'May giat' })
  name: string;

  @ApiProperty({ example: 100000 })
  amount: number;
}

export class RoomBillResponseDto {
  @ApiProperty({ example: '665c4f9d2adbe78c67f28f45' })
  _id: string;

  @ApiProperty({ example: '665c4f9d2adbe78c67f28f44' })
  roomId: string;

  @ApiProperty({ example: '2026-04' })
  billingMonth: string;

  @ApiProperty({ example: 13336 })
  electricityOldReading: number;

  @ApiProperty({ example: 13420 })
  electricityNewReading: number;

  @ApiProperty({ example: 84 })
  electricityUsed: number;

  @ApiProperty({ example: 45 })
  waterOldReading: number;

  @ApiProperty({ example: 52 })
  waterNewReading: number;

  @ApiProperty({ example: 7 })
  waterUsed: number;

  @ApiProperty({ example: 336000 })
  electricityAmount: number;

  @ApiProperty({ example: 105000 })
  waterAmount: number;

  @ApiProperty({ example: 100000 })
  wifiFee: number;

  @ApiProperty({ example: 50000 })
  trashFee: number;

  @ApiProperty({ example: 3500000 })
  monthlyRent: number;

  @ApiProperty({ type: [OtherFeeResponseDto] })
  otherFees: OtherFeeResponseDto[];

  @ApiProperty({ example: 'Thanh toan tu ngay 2-5 hang thang' })
  note: string;

  @ApiProperty({ example: 4091000 })
  totalAmount: number;

  @ApiProperty({ example: '2026-04-30T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-30T09:00:00.000Z' })
  updatedAt: string;
}
