import { Model } from 'mongoose';
import { CreateAccountBankDto } from './dto/create-account-bank.dto';
import { AccountBank, AccountBankDocument } from './schemas/account-bank.schema';
export declare class AccountBankService {
    private readonly accountBankModel;
    constructor(accountBankModel: Model<AccountBankDocument>);
    create(createAccountBankDto: CreateAccountBankDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    list(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getDefault(): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    updateDefault(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, AccountBank, {}> & AccountBank & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
