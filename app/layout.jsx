import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { GraduationCap } from "lucide-react";

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
  return ( false ? (
    <html lang="en">
      <body className={`font-sans antialiased`}>
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground">Working fine! Jai Siya Ram</p>
          </div>
        </div>
      </body>
    </html>) : (
    
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
    )
  );
}
