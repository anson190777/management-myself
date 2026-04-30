import { HydratedDocument, Types } from 'mongoose';
export type RoomBillDocument = HydratedDocument<RoomBill>;
export declare class OtherFee {
    name: string;
    amount: number;
}
export declare class RoomBill {
    roomId: Types.ObjectId;
    billingMonth: string;
    electricityOldReading: number;
    electricityNewReading: number;
    electricityUsed: number;
    waterOldReading: number;
    waterNewReading: number;
    waterUsed: number;
    electricityAmount: number;
    waterAmount: number;
    wifiFee: number;
    trashFee: number;
    monthlyRent: number;
    otherFees: OtherFee[];
    note: string;
    totalAmount: number;
}
export declare const RoomBillSchema: import("mongoose").Schema<RoomBill, import("mongoose").Model<RoomBill, any, any, any, import("mongoose").Document<unknown, any, RoomBill, any> & RoomBill & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RoomBill, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<RoomBill>, {}> & import("mongoose").FlatRecord<RoomBill> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
