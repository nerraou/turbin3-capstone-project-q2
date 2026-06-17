"use client";

import { BedDouble, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

import { rooms } from "../../data/rooms";
import { HotelRoomProductMetadata, Product } from "../../data/types";

export default function RoomsPage() {
  const [cart, setCart] = useState<Product<HotelRoomProductMetadata>[]>([]);

  function addToCart(room: Product<HotelRoomProductMetadata>) {
    setCart((current) => {
      const exists = current.some((item) => item.id === room.id);

      if (exists) return current;

      return [...current, room];
    });
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Rooms</h1>

          <p className="text-muted-foreground">
            Select a room and proceed to checkout.
          </p>
        </div>

        <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({cart.length})
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const inCart = cart.some((item) => item.id === room.id);

          return (
            <Card key={room.id}>
              <img
                src={room.imageUrl}
                alt={room.name}
                className="h-52 w-full rounded-t-lg object-cover"
              />

              <CardHeader>
                <CardTitle>{room.name}</CardTitle>

                <p className="text-sm text-muted-foreground">{room.name}</p>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm">{room.description}</p>

                <div className="flex items-center gap-2 text-sm">
                  <BedDouble className="h-4 w-4" />
                  {room.metadata.beds} bed(s) · {room.metadata.capacity}{" "}
                  guest(s)
                </div>

                <p className="text-lg font-semibold">
                  {room.price.toLocaleString()} MAD
                  <span className="ml-1 text-sm text-muted-foreground">
                    / night
                  </span>
                </p>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  disabled={inCart}
                  onClick={() => addToCart(room)}
                >
                  {inCart ? "Added to Cart" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
