import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "TILIL Insurance Assistant — Trust Islami Life Insurance PLC",
  description:
    "AI-powered assistant for Trust Islami Life Insurance PLC. Shariah-compliant insurance guidance in Bangla & English.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
