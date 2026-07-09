import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add API routing configuration for development only
    historyApiFallback: {
      rewrites: [
        { from: /^\/api\/\d+(\/(json)?)?$/, to: '/api.html' }
      ]
    }
  },
  plugins: [
    tailwindcss(),
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Only include api.html in build for development
  ...(mode !== 'production' && {
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          api: 'api.html'
        }
      }
    }
  })
}));