import { Model, Types } from 'mongoose';
import { CreateRoomBillDto } from './dto/create-room-bill.dto';
import { UpdateRoomBillDto } from './dto/update-room-bill.dto';
import { RoomDocument } from '../rooms/schemas/room.schema';
import { RoomBill, RoomBillDocument } from './schemas/room-bill.schema';
type RoomBillFilters = {
    roomId?: string;
    billingMonth?: string;
    beforeMonth?: string;
    fields?: string;
    page?: number;
    limit?: number;
};
export declare class RoomBillsService {
    private readonly roomBillModel;
    private readonly roomModel;
    constructor(roomBillModel: Model<RoomBillDocument>, roomModel: Model<RoomDocument>);
    create(createRoomBillDto: CreateRoomBillDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findAll(filters: RoomBillFilters): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}> & import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>)[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, updateRoomBillDto: UpdateRoomBillDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, RoomBill, {}> & RoomBill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private buildBillPayload;
}
export {};
