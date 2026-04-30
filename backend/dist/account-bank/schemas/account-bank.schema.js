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
exports.AccountBankSchema = exports.AccountBank = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let AccountBank = class AccountBank {
};
exports.AccountBank = AccountBank;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AccountBank.prototype, "customerCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AccountBank.prototype, "customerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AccountBank.prototype, "bank", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AccountBank.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], AccountBank.prototype, "isDefault", void 0);
exports.AccountBank = AccountBank = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, versionKey: false })
], AccountBank);
exports.AccountBankSchema = mongoose_1.SchemaFactory.createForClass(AccountBank);
exports.AccountBankSchema.index({ isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });
//# sourceMappingURL=account-bank.schema.js.map