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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomBillResponseDto = exports.OtherFeeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class OtherFeeResponseDto {
}
exports.OtherFeeResponseDto = OtherFeeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'May giat' }),
    __metadata("design:type", String)
], OtherFeeResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000 }),
    __metadata("design:type", Number)
], OtherFeeResponseDto.prototype, "amount", void 0);
class RoomBillResponseDto {
}
exports.RoomBillResponseDto = RoomBillResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '665c4f9d2adbe78c67f28f45' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '665c4f9d2adbe78c67f28f44' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "billingMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13336 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "electricityOldReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13420 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "electricityNewReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 84 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "electricityUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "waterOldReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 52 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "waterNewReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "waterUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 336000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "electricityAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 105000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "waterAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "wifiFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "trashFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3500000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "monthlyRent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OtherFeeResponseDto] }),
    __metadata("design:type", Array)
], RoomBillResponseDto.prototype, "otherFees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Thanh toan tu ngay 2-5 hang thang' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4091000 }),
    __metadata("design:type", Number)
], RoomBillResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-30T09:00:00.000Z' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-30T09:00:00.000Z' }),
    __metadata("design:type", String)
], RoomBillResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=room-bill-response.dto.js.map