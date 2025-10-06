import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on the current mode (e.g., development or production)
    const env = loadEnv(mode, process.cwd(), "")

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            proxy: {
                "/api": {
                    target: env.VITE_API_BASE_URL || "http://localhost:8000",
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            if (id.includes("lucide-react") || id.includes("react-icons")) {
                                return "icons"
                            }
                            if (id.includes("react") || id.includes("react-dom")) {
                                return "react-vendor"
                            }
                            if (id.includes("date-fns") || id.includes("moment") || id.includes("lodash")) {
                                return "lib-vendor"
                            }
                            return "vendor"
                        }
                    },
                },
            },
        },
    }
})
