import { PhysicalProductMetadata, Product } from "./types";

export const products: Product<PhysicalProductMetadata>[] = [
  {
    id: "prod_1",
    name: "Moroccan Tea Set",
    description: "Traditional handcrafted tea set.",
    price: 49,
    currency: "$",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1567708415681-d1d249e182eb",
    metadata: {
      type: "souvenir",
      stock: 12,
    },
  },
  {
    id: "prod_2",
    name: "Argan Oil Gift Box",
    description: "Premium cosmetic-grade argan oil.",
    price: 24,
    currency: "$",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
    metadata: {
      type: "beauty",
      stock: 35,
    },
  },
  {
    id: "prod_3",
    name: "Decorative Ceramic Plate",
    description: "Hand-painted ceramic plate.",
    price: 29,
    currency: "$",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
    metadata: {
      type: "home_decor",
      stock: 20,
    },
  },
  {
    id: "prod_4",
    name: "Leather Travel Wallet",
    description: "Genuine leather wallet.",
    price: 19,
    currency: "$",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93",
    metadata: {
      type: "accessory",
      stock: 15,
    },
  },
  {
    id: "prod_5",
    name: "Traditional Djellaba",
    description: "Comfortable traditional garment.",
    price: 59,
    currency: "$",
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1772411534911-504e649deeae",
    metadata: {
      type: "clothing",
      stock: 10,
    },
  },
];
