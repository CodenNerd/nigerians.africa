import type { Metadata } from "next";
import { Suspense } from "react";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteBreadcrumbs } from "@/components/SiteBreadcrumbs";
import { NavigationProgress } from "@/components/NavigationProgress";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";

const display = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "NigeriaForNigerians — A public record of Nigeria",
    template: "%s · NigeriaForNigerians",
  },
  description:
    "A public digital civic institution making Nigeria's government, problems, money, projects, evidence and history visible and connected.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${display.variable} ${sans.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <SiteHeader />
          <SiteBreadcrumbs />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
