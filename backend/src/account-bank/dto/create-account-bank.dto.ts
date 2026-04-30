import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccountBankDto {
  @ApiProperty({ example: 'Nguyen An Son' })
  @IsString()
  @IsNotEmpty()
  customerCode: string;

  @ApiProperty({ example: 'Nguyen An Son' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'MB' })
  @IsString()
  @IsNotEmpty()
  bank: string;

  @ApiProperty({ example: '0328010342' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
