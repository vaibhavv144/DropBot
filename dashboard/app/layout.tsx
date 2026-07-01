import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropBot — AI chatbot for your website",
  description: "Manage your DropBot embeddable website chatbots",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-secondary/30 antialiased">{children}</body>
    </html>
  );
}
