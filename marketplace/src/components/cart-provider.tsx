"use client";
import { CartProvider as OCartProvider } from "react-use-cart";

export default function CartProvider(
  props: Parameters<typeof OCartProvider>[0],
) {
  return <OCartProvider {...props} />;
}
