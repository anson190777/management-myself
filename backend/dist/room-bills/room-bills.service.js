"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomBillsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const room_schema_1 = require("../rooms/schemas/room.schema");
const room_bill_schema_1 = require("./schemas/room-bill.schema");
let RoomBillsService = class RoomBillsService {
    constructor(roomBillModel, roomModel) {
        this.roomBillModel = roomBillModel;
        this.roomModel = roomModel;
    }
    async create(createRoomBillDto) {
        const room = await this.roomModel.findById(createRoomBillDto.roomId).exec();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const billPayload = this.buildBillPayload(createRoomBillDto, room);
        return this.roomBillModel.create(billPayload);
    }
    async findAll(filters) {
        const query = {};
        if (filters.roomId) {
            try {
                query.roomId = new mongoose_2.Types.ObjectId(filters.roomId);
            }
            catch {
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
        const select = filters.fields
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
    findOne(id) {
        return this.roomBillModel.findById(id).populate('roomId').exec();
    }
    async update(id, updateRoomBillDto) {
        const existingBill = await this.roomBillModel.findById(id).exec();
        if (!existingBill) {
            return null;
        }
        const roomId = updateRoomBillDto.roomId ?? existingBill.roomId.toString();
        const room = await this.roomModel.findById(roomId).exec();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const mergedPayload = {
            roomId,
            billingMonth: updateRoomBillDto.billingMonth ?? existingBill.billingMonth,
            electricityOldReading: updateRoomBillDto.electricityOldReading ??
                existingBill.electricityOldReading,
            electricityNewReading: updateRoomBillDto.electricityNewReading ??
                existingBill.electricityNewReading,
            waterOldReading: updateRoomBillDto.waterOldReading ?? existingBill.waterOldReading,
            waterNewReading: updateRoomBillDto.waterNewReading ?? existingBill.waterNewReading,
            wifiFee: updateRoomBillDto.wifiFee ?? existingBill.wifiFee,
            trashFee: updateRoomBillDto.trashFee ?? existingBill.trashFee,
            monthlyRent: updateRoomBillDto.monthlyRent ?? existingBill.monthlyRent,
            otherFees: updateRoomBillDto.otherFees ?? existingBill.otherFees,
            note: updateRoomBillDto.note ?? existingBill.note,
        };
        const billPayload = this.buildBillPayload(mergedPayload, room);
        return this.roomBillModel
            .findByIdAndUpdate(id, billPayload, { new: true, runValidators: true })
            .populate('roomId')
            .exec();
    }
    remove(id) {
        return this.roomBillModel.findByIdAndDelete(id).exec();
    }
    buildBillPayload(input, room) {
        const electricityUsed = Math.max(0, input.electricityNewReading - input.electricityOldReading);
        const waterUsed = Math.max(0, input.waterNewReading - input.waterOldReading);
        const electricityAmount = electricityUsed * room.electricityUnitPrice;
        const waterAmount = waterUsed * room.waterUnitPrice;
        const wifiFee = input.wifiFee ?? room.wifiFee;
        const trashFee = input.trashFee ?? room.trashFee;
        const monthlyRent = input.monthlyRent ?? room.monthlyRent;
        const otherFees = input.otherFees ?? [];
        const otherFeesTotal = otherFees.reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
        const totalAmount = electricityAmount +
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
};
exports.RoomBillsService = RoomBillsService;
exports.RoomBillsService = RoomBillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(room_bill_schema_1.RoomBill.name)),
    __param(1, (0, mongoose_1.InjectModel)(room_schema_1.Room.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RoomBillsService);
//# sourceMappingURL=room-bills.service.js.map