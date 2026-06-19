import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@components/theme-provider";
import { cn } from "@lib/utils";
import "./globals.css";

import ReactQueryProviders from "@components/react-query-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

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
        <ReactQueryProviders>
          <ThemeProvider>{children}</ThemeProvider>
        </ReactQueryProviders>
      </body>
    </html>
  );
}
