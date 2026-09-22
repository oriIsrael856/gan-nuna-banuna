import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Custom HTML shell for web static export.
 * Adds iOS "Add to Home Screen" support so the web app installs and
 * behaves like a native app (standalone, branded icon and title).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>גן נונה בנונה</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="נונה בנונה" />
        <meta name="theme-color" content="#7A9A72" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/*
          Icon font served statically and declared up front, so icons render
          from the first paint in every browser instead of depending on a
          runtime font injection (which showed empty boxes on some devices).
        */}
        <link
          rel="preload"
          href="/fonts/Ionicons.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "@font-face{font-family:ionicons;src:url(/fonts/Ionicons.ttf) format('truetype');font-display:block;}",
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
