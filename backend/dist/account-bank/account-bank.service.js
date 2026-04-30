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
exports.AccountBankService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const account_bank_schema_1 = require("./schemas/account-bank.schema");
let AccountBankService = class AccountBankService {
    constructor(accountBankModel) {
        this.accountBankModel = accountBankModel;
    }
    async create(createAccountBankDto) {
        if (createAccountBankDto.isDefault) {
            await this.accountBankModel.updateMany({}, { isDefault: false }).exec();
        }
        return this.accountBankModel.create({
            ...createAccountBankDto,
            isDefault: createAccountBankDto.isDefault ?? false,
        });
    }
    list() {
        return this.accountBankModel.find().sort({ createdAt: -1 }).exec();
    }
    getDefault() {
        return this.accountBankModel.findOne({ isDefault: true }).exec();
    }
    async updateDefault(id) {
        const existing = await this.accountBankModel.findById(id).exec();
        if (!existing) {
            throw new common_1.NotFoundException('Account bank not found');
        }
        await this.accountBankModel.updateMany({}, { isDefault: false }).exec();
        return this.accountBankModel
            .findByIdAndUpdate(id, { isDefault: true }, { new: true })
            .exec();
    }
    remove(id) {
        return this.accountBankModel.findByIdAndDelete(id).exec();
    }
};
exports.AccountBankService = AccountBankService;
exports.AccountBankService = AccountBankService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(account_bank_schema_1.AccountBank.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AccountBankService);
//# sourceMappingURL=account-bank.service.js.map