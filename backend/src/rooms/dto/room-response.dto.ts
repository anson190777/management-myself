import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: '665c4f9d2adbe78c67f28f44' })
  _id: string;

  @ApiProperty({ example: 'Phong 1' })
  name: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  nameUser: string;

  @ApiProperty({ example: 3500000 })
  monthlyRent: number;

  @ApiProperty({ example: 4000 })
  electricityUnitPrice: number;

  @ApiProperty({ example: 15000 })
  waterUnitPrice: number;

  @ApiProperty({ example: 100000 })
  wifiFee: number;

  @ApiProperty({ example: 50000 })
  trashFee: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-04-30T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-04-30T09:00:00.000Z' })
  updatedAt: string;
}
