import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class OtherFeeDto {
  @ApiProperty({ example: 'May giat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateRoomBillDto {
  @ApiProperty({ example: '665c4f9d2adbe78c67f28f44' })
  @IsMongoId()
  roomId: string;

  @ApiProperty({ example: '2026-04', description: 'YYYY-MM' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  billingMonth: string;

  @ApiProperty({ example: 13336 })
  @IsNumber()
  @Min(0)
  electricityOldReading: number;

  @ApiProperty({ example: 13420 })
  @IsNumber()
  @Min(0)
  electricityNewReading: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  waterOldReading: number;

  @ApiProperty({ example: 52 })
  @IsNumber()
  @Min(0)
  waterNewReading: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  wifiFee?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trashFee?: number;

  @ApiPropertyOptional({ example: 3500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRent?: number;

  @ApiPropertyOptional({ type: [OtherFeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherFeeDto)
  @IsOptional()
  otherFees?: OtherFeeDto[];

  @ApiPropertyOptional({ example: 'Thanh toan tu ngay 2-5 hang thang' })
  @IsString()
  @IsOptional()
  note?: string;
}
