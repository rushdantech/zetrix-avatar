import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** Root path `/` for https://avatar-demo.zetrix.com/; subpath for legacy GitHub Pages when unset. */
function resolveBase(mode: string): string {
  const env = loadEnv(mode, process.cwd(), "");
  const explicit = env.VITE_BASE_PATH?.trim();
  if (explicit) {
    const withSlash = explicit.startsWith("/") ? explicit : `/${explicit}`;
    return withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
  }
  if (process.env.GITHUB_REPOSITORY != null) {
    return `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`;
  }
  return "/";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: resolveBase(mode),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
