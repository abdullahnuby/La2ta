import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "لقطة | عروض الأقصر 🔥",
  description:
    "لقط أحسن عرض في الأقصر — اكتشف عروض وخصومات المحلات الحقيقية قبل ما تنزل تشتري. عروض محدودة المدة من الملابس والمطاعم والإلكترونيات وأكتر.",
  keywords: ["لقطة", "LA2TA", "عروض", "خصومات", "الأقصر", "عروض الأقصر", "تخفيضات"],
  applicationName: "LA2TA",
  openGraph: {
    title: "لقطة 🔥 — أقوى العروض في الأقصر",
    description: "اكتشف العروض قبل ما تنزل تشتري — عروض حقيقية محدودة المدة في الأقصر",
    type: "website",
    locale: "ar_EG",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1310" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
