import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
  ) {}

  create(createRoomDto: CreateRoomDto) {
    return this.roomModel.create(createRoomDto);
  }

  async findAll(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    const [items, totalItems] = await Promise.all([
      this.roomModel.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit).exec(),
      this.roomModel.countDocuments(),
    ]);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  }

  findOne(id: string) {
    return this.roomModel.findById(id).exec();
  }

  update(id: string, updateRoomDto: UpdateRoomDto) {
    return this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true, runValidators: true })
      .exec();
  }

  remove(id: string) {
    return this.roomModel.findByIdAndDelete(id).exec();
  }
}
