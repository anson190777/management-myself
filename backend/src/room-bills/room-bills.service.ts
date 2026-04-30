import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateRoomBillDto } from './dto/create-room-bill.dto';
import { UpdateRoomBillDto } from './dto/update-room-bill.dto';
import { Room, RoomDocument } from '../rooms/schemas/room.schema';
import { RoomBill, RoomBillDocument } from './schemas/room-bill.schema';

type RoomBillFilters = {
  roomId?: string;
  billingMonth?: string;
  beforeMonth?: string;
  fields?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class RoomBillsService {
  constructor(
    @InjectModel(RoomBill.name)
    private readonly roomBillModel: Model<RoomBillDocument>,
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  async create(createRoomBillDto: CreateRoomBillDto) {
    const room = await this.roomModel.findById(createRoomBillDto.roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const billPayload = this.buildBillPayload(createRoomBillDto, room);
    return this.roomBillModel.create(billPayload);
  }

  async findAll(filters: RoomBillFilters) {
    const query: FilterQuery<RoomBillDocument> = {};
    if (filters.roomId) {
      try {
        query.roomId = new Types.ObjectId(filters.roomId);
      } catch {
        query.roomId = filters.roomId;
      }
    }
    if (filters.billingMonth) {
      query.billingMonth = filters.billingMonth;
    }
    if (filters.beforeMonth) {
      query.billingMonth = { $lt: filters.beforeMonth };
    }

    const safePage = Math.max(1, filters.page ?? 1);
    const safeLimit = Math.max(1, Math.min(100, filters.limit ?? 20));
    const skip = (safePage - 1) * safeLimit;
    const select =
      filters.fields
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .join(' ') || undefined;

    const findQuery = this.roomBillModel
      .find(query, select)
      .sort({ billingMonth: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    if (!select || select.includes('roomId')) {
      findQuery.populate('roomId');
    }

    const [items, totalItems] = await Promise.all([
      findQuery.exec(),
      this.roomBillModel.countDocuments(query),
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
    return this.roomBillModel.findById(id).populate('roomId').exec();
  }

  async update(id: string, updateRoomBillDto: UpdateRoomBillDto) {
    const existingBill = await this.roomBillModel.findById(id).exec();
    if (!existingBill) {
      return null;
    }

    const roomId = updateRoomBillDto.roomId ?? existingBill.roomId.toString();
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const mergedPayload = {
      roomId,
      billingMonth: updateRoomBillDto.billingMonth ?? existingBill.billingMonth,
      electricityOldReading:
        updateRoomBillDto.electricityOldReading ??
        existingBill.electricityOldReading,
      electricityNewReading:
        updateRoomBillDto.electricityNewReading ??
        existingBill.electricityNewReading,
      waterOldReading:
        updateRoomBillDto.waterOldReading ?? existingBill.waterOldReading,
      waterNewReading:
        updateRoomBillDto.waterNewReading ?? existingBill.waterNewReading,
      wifiFee: updateRoomBillDto.wifiFee ?? existingBill.wifiFee,
      trashFee: updateRoomBillDto.trashFee ?? existingBill.trashFee,
      monthlyRent: updateRoomBillDto.monthlyRent ?? existingBill.monthlyRent,
      otherFees: updateRoomBillDto.otherFees ?? existingBill.otherFees,
      note: updateRoomBillDto.note ?? existingBill.note,
    } as CreateRoomBillDto;

    const billPayload = this.buildBillPayload(mergedPayload, room);
    return this.roomBillModel
      .findByIdAndUpdate(id, billPayload, { new: true, runValidators: true })
      .populate('roomId')
      .exec();
  }

  remove(id: string) {
    return this.roomBillModel.findByIdAndDelete(id).exec();
  }

  private buildBillPayload(
    input: CreateRoomBillDto,
    room: RoomDocument,
  ): Partial<RoomBill> {
    const electricityUsed = Math.max(
      0,
      input.electricityNewReading - input.electricityOldReading,
    );
    const waterUsed = Math.max(
      0,
      input.waterNewReading - input.waterOldReading,
    );
    const electricityAmount = electricityUsed * room.electricityUnitPrice;
    const waterAmount = waterUsed * room.waterUnitPrice;
    const wifiFee = input.wifiFee ?? room.wifiFee;
    const trashFee = input.trashFee ?? room.trashFee;
    const monthlyRent = input.monthlyRent ?? room.monthlyRent;
    const otherFees = input.otherFees ?? [];
    const otherFeesTotal = otherFees.reduce(
      (sum, fee) => sum + (fee.amount ?? 0),
      0,
    );

    const totalAmount =
      electricityAmount +
      waterAmount +
      wifiFee +
      trashFee +
      monthlyRent +
      otherFeesTotal;

    return {
      roomId: room._id,
      billingMonth: input.billingMonth,
      electricityOldReading: input.electricityOldReading,
      electricityNewReading: input.electricityNewReading,
      electricityUsed,
      waterOldReading: input.waterOldReading,
      waterNewReading: input.waterNewReading,
      waterUsed,
      electricityAmount,
      waterAmount,
      wifiFee,
      trashFee,
      monthlyRent,
      otherFees,
      note: input.note ?? '',
      totalAmount,
    };
  }
}
