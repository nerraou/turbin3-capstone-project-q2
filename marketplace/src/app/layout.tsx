import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@components/theme-provider";
import { cn } from "@lib/utils";
import "./globals.css";
import CartProvider from "@components/cart-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body>
        <CartProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
