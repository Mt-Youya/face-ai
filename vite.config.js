import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import AutoImport from "unplugin-auto-import/vite"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        AutoImport({
            imports: ["react", "react-router", "react-router-dom"],
            include: [
                /\.[tj]sx?$/,
            ],
        }),
    ],
    server: {
        port: 8000,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
})
