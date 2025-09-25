import { Nunito } from "next/font/google";
import "@/src/styles/shadcn.css";
import { ThemeProvider } from "@/src/providers/theme-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/logo-light.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/logo-dark.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className={nunito.className} suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>

          <Toaster />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
