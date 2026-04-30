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
exports.RoomBillSchema = exports.RoomBill = exports.OtherFee = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const room_schema_1 = require("../../rooms/schemas/room.schema");
let OtherFee = class OtherFee {
};
exports.OtherFee = OtherFee;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], OtherFee.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], OtherFee.prototype, "amount", void 0);
exports.OtherFee = OtherFee = __decorate([
    (0, mongoose_1.Schema)({ _id: false, versionKey: false })
], OtherFee);
const OtherFeeSchema = mongoose_1.SchemaFactory.createForClass(OtherFee);
let RoomBill = class RoomBill {
};
exports.RoomBill = RoomBill;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: room_schema_1.Room.name, required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RoomBill.prototype, "roomId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, match: /^\d{4}-\d{2}$/ }),
    __metadata("design:type", String)
], RoomBill.prototype, "billingMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "electricityOldReading", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "electricityNewReading", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "electricityUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "waterOldReading", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "waterNewReading", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "waterUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "electricityAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "waterAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "wifiFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "trashFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "monthlyRent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [OtherFeeSchema], default: [] }),
    __metadata("design:type", Array)
], RoomBill.prototype, "otherFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], RoomBill.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], RoomBill.prototype, "totalAmount", void 0);
exports.RoomBill = RoomBill = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, versionKey: false })
], RoomBill);
exports.RoomBillSchema = mongoose_1.SchemaFactory.createForClass(RoomBill);
exports.RoomBillSchema.index({ roomId: 1, billingMonth: 1 }, { unique: true });
//# sourceMappingURL=room-bill.schema.js.map