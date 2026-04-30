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
exports.RoomResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class RoomResponseDto {
}
exports.RoomResponseDto = RoomResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '665c4f9d2adbe78c67f28f44' }),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Phong 1' }),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nguyen Van A' }),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "nameUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3500000 }),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "monthlyRent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4000 }),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "electricityUnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "waterUnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000 }),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "wifiFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "trashFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], RoomResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-30T09:00:00.000Z' }),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04-30T09:00:00.000Z' }),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=room-response.dto.js.map