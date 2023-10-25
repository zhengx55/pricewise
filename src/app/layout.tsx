import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const spaceGrotest = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pricewise App",
  description:
    "Track product prices effortlessly and save mony on your online shopping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotest.className}>
        <main className="mx-auto max-w-10xl">
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  );
}
