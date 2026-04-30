import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Phong 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  nameUser: string;

  @ApiProperty({ example: 3500000 })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ example: 4000 })
  @IsNumber()
  @Min(0)
  electricityUnitPrice: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  waterUnitPrice: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  wifiFee: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  trashFee: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
