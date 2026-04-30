import { CreateRoomBillDto } from './dto/create-room-bill.dto';
import { UpdateRoomBillDto } from './dto/update-room-bill.dto';
import { RoomBillsService } from './room-bills.service';
export declare class RoomBillsController {
    private readonly roomBillsService;
    constructor(roomBillsService: RoomBillsService);
    create(createRoomBillDto: CreateRoomBillDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(roomId?: string, billingMonth?: string, beforeMonth?: string, fields?: string, page?: string, limit?: string): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        pagination: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, updateRoomBillDto: UpdateRoomBillDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}> & import("mongoose").Document<unknown, {}, import("./schemas/room-bill.schema").RoomBill, {}> & import("./schemas/room-bill.schema").RoomBill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
