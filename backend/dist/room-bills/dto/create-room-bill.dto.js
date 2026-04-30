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
exports.CreateRoomBillDto = exports.OtherFeeDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OtherFeeDto {
}
exports.OtherFeeDto = OtherFeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'May giat' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], OtherFeeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OtherFeeDto.prototype, "amount", void 0);
class CreateRoomBillDto {
}
exports.CreateRoomBillDto = CreateRoomBillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '665c4f9d2adbe78c67f28f44' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateRoomBillDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-04', description: 'YYYY-MM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}$/),
    __metadata("design:type", String)
], CreateRoomBillDto.prototype, "billingMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13336 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "electricityOldReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 13420 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "electricityNewReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "waterOldReading", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 52 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "waterNewReading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "wifiFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "trashFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3500000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRoomBillDto.prototype, "monthlyRent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [OtherFeeDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OtherFeeDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateRoomBillDto.prototype, "otherFees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Thanh toan tu ngay 2-5 hang thang' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRoomBillDto.prototype, "note", void 0);
//# sourceMappingURL=create-room-bill.dto.js.map