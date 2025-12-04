import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "./src/shared"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            // React and React DOM
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            // Radix UI components
            if (id.includes("@radix-ui")) {
              return "radix-ui";
            }
            // UI libraries
            if (id.includes("lucide-react") || id.includes("cmdk") || id.includes("sonner")) {
              return "ui-libs";
            }
            // Form libraries
            if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
              return "form-libs";
            }
            // Table library
            if (id.includes("@tanstack/react-table")) {
              return "table-lib";
            }
            // Date libraries
            if (id.includes("date-fns") || id.includes("react-day-picker")) {
              return "date-libs";
            }
            // DnD Kit
            if (id.includes("@dnd-kit")) {
              return "dnd-kit";
            }
            // Other vendor libraries
            return "vendor";
          }
          // Prototype chunks
          if (id.includes("/prototypes/")) {
            const match = id.match(/prototypes\/([^/]+)/);
            if (match) {
              return `prototype-${match[1]}`;
            }
          }
          // Registry components
          if (id.includes("/registry/ui/")) {
            return "registry-ui";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
