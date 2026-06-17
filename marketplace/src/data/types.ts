export interface Product<T> {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "MAD";
  imageUrl: string;
  available: boolean;
  metadata: T;
}

export interface HotelRoomProductMetadata {
  type: "hotel_room";

  roomNumber: string;
  category: string;

  beds: number;
  capacity: number;
}

export interface PhysicalProductMetadata {
  type: "souvenir" | "accessory" | "home_decor" | "clothing" | "beauty";

  stock: number;
}
