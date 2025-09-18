import { ResponseError } from "@/utils/response-error.utils";
import { roomTypeRepository } from "../room-type/room-type.repository";
import { wishlistRepository } from "./wishlist.repository";
import { RoomStatus } from "../room/room.type";

export const WishlistService = {
  async getWishlist(tenantId: string) {
    const wishlist = await wishlistRepository.findAll(
      {
        tenant: tenantId,
      },
      {},
      [
        {
          path: "roomType",
          populate: [
            {
              path: "photos",
            },
            {
              path: "facilities",
            },
            {
              path: "rooms",
            },
          ],
        },
        {
          path: "kost",
          populate: [
            {
              path: "photos",
            },
            {
              path: "facilities",
            },
          ],
        },
      ]
    );

    return wishlist.map((data: any) => {
      const roomType = data.roomType;
      const kost = data.kost;
      const address = kost?.address;

      const allPhotos = [...roomType.photos, ...kost.photos];
      const allFacilities = [...roomType.facilities, ...kost.facilities];

      const availableRooms = roomType.rooms.filter(
        (room: any) => room.status === RoomStatus.AVAILABLE
      ).length;

      return {
        id: data._id,
        roomType_id: roomType._id,
        kostName: `${kost.name} - ${roomType.name}`,
        address: `${address.district}, ${address.city}`,
        type: kost.type,
        price: roomType.price,
        images: allPhotos.map((image) => image.url),
        facilities: allFacilities.map((f) => f.name),
        availableRooms: availableRooms,
      };
    });
  },
  async getWishlistByKostType(tenantId: string, roomTypeId: string) {
    return (await wishlistRepository.findOne({
      roomType: roomTypeId,
      tenant: tenantId,
    }))
      ? true
      : false;
  },
  async addWishlist(tenantId: string, roomTypeId: string) {
    const roomType = await roomTypeRepository.findById(roomTypeId);
    if (!roomType) throw new ResponseError(404, "Tipe kamar tidak ditemukan");
    const existing = await wishlistRepository.findOne({
      tenant: tenantId,
      kost: roomType.kost,
      roomType: roomType._id,
    });
    if (existing) throw new ResponseError(400, "Kost sudah ada di wishlist");

    return await wishlistRepository.create({
      tenant: tenantId,
      kost: roomType.kost,
      roomType: roomType._id,
    });
  },

  async removeWishlist(tenantId: string, roomTypeId: string) {
    const wishlist = await wishlistRepository.findOne({
      roomType: roomTypeId,
      tenant: tenantId,
    });

    if (!wishlist) throw new ResponseError(404, "Wishlist tidak ditemukan");
    return await wishlistRepository.deleteById(wishlist._id);
  },
};
