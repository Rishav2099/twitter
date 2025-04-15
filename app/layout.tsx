import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/SessionProvider";
import Navbar from "@/components/Navbar";


export const metadata: Metadata = {
  title: "Twitter",
  description: "Whats happening in the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
