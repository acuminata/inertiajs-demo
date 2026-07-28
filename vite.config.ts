import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import devServer from '@hono/vite-dev-server'

export default defineConfig({
    plugins: [
        svelte(), // Compiles .svelte pages into JS assets
        devServer({
            entry: 'src/index.ts', // The server entrypoint
            injectClientScript: true
        }),
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
