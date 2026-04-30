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
exports.RoomBillsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_room_bill_dto_1 = require("./dto/create-room-bill.dto");
const room_bill_response_dto_1 = require("./dto/room-bill-response.dto");
const update_room_bill_dto_1 = require("./dto/update-room-bill.dto");
const room_bills_service_1 = require("./room-bills.service");
let RoomBillsController = class RoomBillsController {
    constructor(roomBillsService) {
        this.roomBillsService = roomBillsService;
    }
    create(createRoomBillDto) {
        return this.roomBillsService.create(createRoomBillDto);
    }
    findAll(roomId, billingMonth, beforeMonth, fields, page, limit) {
        return this.roomBillsService.findAll({
            roomId,
            billingMonth,
            beforeMonth,
            fields,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
        });
    }
    findOne(id) {
        return this.roomBillsService.findOne(id);
    }
    update(id, updateRoomBillDto) {
        return this.roomBillsService.update(id, updateRoomBillDto);
    }
    remove(id) {
        return this.roomBillsService.remove(id);
    }
};
exports.RoomBillsController = RoomBillsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a monthly bill record' }),
    (0, swagger_1.ApiBody)({ type: create_room_bill_dto_1.CreateRoomBillDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Room bill created successfully',
        type: room_bill_response_dto_1.RoomBillResponseDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_bill_dto_1.CreateRoomBillDto]),
    __metadata("design:returntype", void 0)
], RoomBillsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly bill records' }),
    (0, swagger_1.ApiQuery)({ name: 'roomId', required: false, description: 'Filter by room id' }),
    (0, swagger_1.ApiQuery)({
        name: 'billingMonth',
        required: false,
        description: 'Filter by month in format YYYY-MM',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fields',
        required: false,
        description: 'Comma-separated fields, ex: electricityNewReading,waterNewReading',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'beforeMonth',
        required: false,
        description: 'Get bills before month YYYY-MM (for previous bill lookup)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Room bills fetched successfully',
        type: room_bill_response_dto_1.RoomBillResponseDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('roomId')),
    __param(1, (0, common_1.Query)('billingMonth')),
    __param(2, (0, common_1.Query)('beforeMonth')),
    __param(3, (0, common_1.Query)('fields')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RoomBillsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get monthly bill record by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Room bill id' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Room bill fetched successfully',
        type: room_bill_response_dto_1.RoomBillResponseDto,
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomBillsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update monthly bill record by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Room bill id' }),
    (0, swagger_1.ApiBody)({ type: update_room_bill_dto_1.UpdateRoomBillDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Room bill updated successfully',
        type: room_bill_response_dto_1.RoomBillResponseDto,
    }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_bill_dto_1.UpdateRoomBillDto]),
    __metadata("design:returntype", void 0)
], RoomBillsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete monthly bill record by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Room bill id' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Room bill deleted successfully',
        type: room_bill_response_dto_1.RoomBillResponseDto,
    }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomBillsController.prototype, "remove", null);
exports.RoomBillsController = RoomBillsController = __decorate([
    (0, swagger_1.ApiTags)('room-bills'),
    (0, common_1.Controller)('room-bills'),
    __metadata("design:paramtypes", [room_bills_service_1.RoomBillsService])
], RoomBillsController);
//# sourceMappingURL=room-bills.controller.js.map