import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stoop",
  description:
    "Neighborhood sharing and connection platform. Borrow tools, share skills, and build community — right from your stoop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
