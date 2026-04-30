import { AccountBankService } from './account-bank.service';
import { CreateAccountBankDto } from './dto/create-account-bank.dto';
export declare class AccountBankController {
    private readonly accountBankService;
    constructor(accountBankService: AccountBankService);
    create(createAccountBankDto: CreateAccountBankDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    list(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getDefault(): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateDefault(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/account-bank.schema").AccountBank, {}> & import("./schemas/account-bank.schema").AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
