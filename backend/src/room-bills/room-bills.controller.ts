import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoomBillDto } from './dto/create-room-bill.dto';
import { RoomBillResponseDto } from './dto/room-bill-response.dto';
import { UpdateRoomBillDto } from './dto/update-room-bill.dto';
import { RoomBillsService } from './room-bills.service';

@ApiTags('room-bills')
@Controller('room-bills')
export class RoomBillsController {
  constructor(private readonly roomBillsService: RoomBillsService) {}

  @ApiOperation({ summary: 'Create a monthly bill record' })
  @ApiBody({ type: CreateRoomBillDto })
  @ApiCreatedResponse({
    description: 'Room bill created successfully',
    type: RoomBillResponseDto,
  })
  @Post()
  create(@Body() createRoomBillDto: CreateRoomBillDto) {
    return this.roomBillsService.create(createRoomBillDto);
  }

  @ApiOperation({ summary: 'Get monthly bill records' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Filter by room id' })
  @ApiQuery({
    name: 'billingMonth',
    required: false,
    description: 'Filter by month in format YYYY-MM',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Comma-separated fields, ex: electricityNewReading,waterNewReading',
  })
  @ApiQuery({
    name: 'beforeMonth',
    required: false,
    description: 'Get bills before month YYYY-MM (for previous bill lookup)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Room bills fetched successfully',
    type: RoomBillResponseDto,
    isArray: true,
  })
  @Get()
  findAll(
    @Query('roomId') roomId?: string,
    @Query('billingMonth') billingMonth?: string,
    @Query('beforeMonth') beforeMonth?: string,
    @Query('fields') fields?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.roomBillsService.findAll({
      roomId,
      billingMonth,
      beforeMonth,
      fields,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @ApiOperation({ summary: 'Get monthly bill record by id' })
  @ApiParam({ name: 'id', description: 'Room bill id' })
  @ApiOkResponse({
    description: 'Room bill fetched successfully',
    type: RoomBillResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomBillsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update monthly bill record by id' })
  @ApiParam({ name: 'id', description: 'Room bill id' })
  @ApiBody({ type: UpdateRoomBillDto })
  @ApiOkResponse({
    description: 'Room bill updated successfully',
    type: RoomBillResponseDto,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomBillDto: UpdateRoomBillDto,
  ) {
    return this.roomBillsService.update(id, updateRoomBillDto);
  }

  @ApiOperation({ summary: 'Delete monthly bill record by id' })
  @ApiParam({ name: 'id', description: 'Room bill id' })
  @ApiOkResponse({
    description: 'Room bill deleted successfully',
    type: RoomBillResponseDto,
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomBillsService.remove(id);
  }
}
