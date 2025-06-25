import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Drush Booking",
    template: "%s | Drush Booking",
  },
  description: "Drush Booking is a booking system developed for Drush Lodge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${GeistSans.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
