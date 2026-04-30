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
exports.AccountBankController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const account_bank_service_1 = require("./account-bank.service");
const create_account_bank_dto_1 = require("./dto/create-account-bank.dto");
let AccountBankController = class AccountBankController {
    constructor(accountBankService) {
        this.accountBankService = accountBankService;
    }
    create(createAccountBankDto) {
        return this.accountBankService.create(createAccountBankDto);
    }
    list() {
        return this.accountBankService.list();
    }
    getDefault() {
        return this.accountBankService.getDefault();
    }
    updateDefault(id) {
        return this.accountBankService.updateDefault(id);
    }
    remove(id) {
        return this.accountBankService.remove(id);
    }
};
exports.AccountBankController = AccountBankController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create account bank' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Account bank created successfully' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_bank_dto_1.CreateAccountBankDto]),
    __metadata("design:returntype", void 0)
], AccountBankController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get account bank list' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Account bank list fetched successfully' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountBankController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get default account bank' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Default account bank fetched successfully' }),
    (0, common_1.Get)('default'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountBankController.prototype, "getDefault", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Set account bank as default' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Account bank id' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Default account bank updated successfully' }),
    (0, common_1.Patch)(':id/default'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountBankController.prototype, "updateDefault", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete account bank' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Account bank id' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Account bank deleted successfully' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountBankController.prototype, "remove", null);
exports.AccountBankController = AccountBankController = __decorate([
    (0, swagger_1.ApiTags)('account-banks'),
    (0, common_1.Controller)('account-banks'),
    __metadata("design:paramtypes", [account_bank_service_1.AccountBankService])
], AccountBankController);
//# sourceMappingURL=account-bank.controller.js.map