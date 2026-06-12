"use client";
import { getQueryClient } from "@lib/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode } from "react";

interface ReactQueryProvidersProps {
  children: ReactNode;
}

export default function ReactQueryProviders(props: ReactQueryProvidersProps) {
  const { children } = props;

  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
