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
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Create a room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiCreatedResponse({
    description: 'Room created successfully',
    type: RoomResponseDto,
  })
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Get all rooms' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Rooms fetched successfully',
    type: RoomResponseDto,
    isArray: true,
  })
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.roomsService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @ApiOperation({ summary: 'Get room by id' })
  @ApiParam({ name: 'id', description: 'Room id' })
  @ApiOkResponse({
    description: 'Room fetched successfully',
    type: RoomResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update room by id' })
  @ApiParam({ name: 'id', description: 'Room id' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiOkResponse({
    description: 'Room updated successfully',
    type: RoomResponseDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete room by id' })
  @ApiParam({ name: 'id', description: 'Room id' })
  @ApiOkResponse({
    description: 'Room deleted successfully',
    type: RoomResponseDto,
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
