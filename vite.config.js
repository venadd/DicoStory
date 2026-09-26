import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      filename: "sw.js",
      manifestFilename: "manifest.webmanifest",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "DicoStory",
        short_name: "DicoStory",
        description: "Share your stories and memories around Dicoding",
        theme_color: "#F5F6F8",
        icons: [
          {
            src: "/src/public/favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/src/public/favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/src/public/favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "libs-cache",
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
});
