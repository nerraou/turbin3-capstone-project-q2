"use client";

import { Package, ShoppingCart } from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { useCart } from "react-use-cart";
import { products } from "../../data/products";
import { PhysicalProductMetadata, Product } from "../../data/types";

function getTypeLabel(type: PhysicalProductMetadata["type"]) {
  switch (type) {
    case "souvenir":
      return "Souvenir";
    case "accessory":
      return "Accessory";
    case "home_decor":
      return "Home Decor";
    case "clothing":
      return "Clothing";
    case "beauty":
      return "Beauty";
  }
}

export default function ProductsPage() {
  const { addItem } = useCart();

  function addToCart(product: Product<PhysicalProductMetadata>) {
    addItem(product);
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>

          <p className="text-muted-foreground">
            Browse souvenirs and local products.
          </p>
        </div>

        <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          return (
            <Card key={product.id}>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-56 w-full rounded-t-lg object-cover"
              />

              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>

                  <Badge variant="secondary">
                    {getTypeLabel(product.metadata.type)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  {product.metadata.stock} available
                </div>

                <p className="text-xl font-semibold">
                  {product.price.toLocaleString()} MAD
                </p>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!product.available}
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
