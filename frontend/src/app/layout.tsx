import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predicto Arena",
  description: "A GenLayer-powered prediction market terminal with oracle-assisted market resolution."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
