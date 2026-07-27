import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [
        svelte(), // Compiles .svelte pages into JS assets
    ],
    build: {
        outDir: "dist",
        assetsDir: "static",
        manifest: true,
        rolldownOptions: {
            input: "/src/client.ts",
        },
    },
});
