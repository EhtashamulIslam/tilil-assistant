import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TILIL Insurance Assistant",
  description:
    "AI assistant for Trust Islami Life Insurance PLC — Shariah-compliant insurance guidance in Bangla & English. Powered by GitHub Models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
