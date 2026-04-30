import { HydratedDocument } from 'mongoose';
export type RoomDocument = HydratedDocument<Room>;
export declare class Room {
    name: string;
    nameUser: string;
    monthlyRent: number;
    electricityUnitPrice: number;
    waterUnitPrice: number;
    wifiFee: number;
    trashFee: number;
    isActive: boolean;
}
export declare const RoomSchema: import("mongoose").Schema<Room, import("mongoose").Model<Room, any, any, any, import("mongoose").Document<unknown, any, Room, any> & Room & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Room, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Room>, {}> & import("mongoose").FlatRecord<Room> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
