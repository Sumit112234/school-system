import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduConnect - School Management System",
  description:
    "A comprehensive school management system for students, teachers, administrators, and support staff.",
  keywords: ["school", "education", "management", "learning", "students", "teachers"],
};

export const viewport = {
  themeColor: "#1A2980",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
