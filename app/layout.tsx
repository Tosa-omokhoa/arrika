import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arrika | The Art of Words",
  description:
    "A beautifully crafted word game. A little space to think. A new way to play. Make every letter count.",
  applicationName: "Arrika",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
