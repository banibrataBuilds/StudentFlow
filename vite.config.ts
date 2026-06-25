import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-three"
            }
            if (id.includes("framer-motion") || id.includes("recharts")) {
              return "vendor-ui"
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix"
            }
            if (id.includes("@dnd-kit")) {
              return "vendor-dnd"
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase"
            }
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("/zod/")) {
              return "vendor-forms"
            }
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
              return "vendor-react"
            }
          }
        },
      },
    },
  },
})
