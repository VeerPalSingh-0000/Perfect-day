"use client";

import { ClientOnly } from "@/components/ClientOnly";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientOnly>{children}</ClientOnly>;
}
