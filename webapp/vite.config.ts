import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { VitePWA } from "vite-plugin-pwa";

const port = 3000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      // e.g. use TypeScript check
      typescript: true,
    }),
    VitePWA({
      devOptions: { enabled: true },

      registerType: "prompt", // default

      workbox: {
        globPatterns: [
          "**/*.{js,css,html}", // default
        ],
      },
    }),
  ],
  server: {
    port,
    host: true, // expose in LAN -- needed to run containerized
  },
  preview: {
    port,
    host: true, // expose in LAN
  },
  base: "/fitness-tracker",
});
