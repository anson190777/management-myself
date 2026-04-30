import { HydratedDocument } from 'mongoose';
export type AccountBankDocument = HydratedDocument<AccountBank>;
export declare class AccountBank {
    customerCode: string;
    customerName: string;
    bank: string;
    accountNumber: string;
    isDefault: boolean;
}
export declare const AccountBankSchema: import("mongoose").Schema<AccountBank, import("mongoose").Model<AccountBank, any, any, any, import("mongoose").Document<unknown, any, AccountBank, any> & AccountBank & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AccountBank, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<AccountBank>, {}> & import("mongoose").FlatRecord<AccountBank> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
