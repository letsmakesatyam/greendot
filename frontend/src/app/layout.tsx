import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ServerStatus from "@/components/ServerStatus";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Product Catalog | MEA Management",
  description: "Building Care & Cleaning Products Catalog Management System",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234f46e5'/><text x='50' y='60' font-size='60' font-weight='bold' fill='white' text-anchor='middle'>C</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ServerStatus />
          <Navbar />
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
