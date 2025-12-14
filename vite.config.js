import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

/**
 * Vite configuration for local development.
 * Serves the dev/index.html test page with HMR.
 */
export default defineConfig({
    plugins: [preact()],

    root: 'dev',

    server: {
        port: 5173,
        open: true,
        fs: {
            // Allow serving files from dist folder
            allow: ['..']
        }
    },

    resolve: {
        alias: {
            // Serve /v1/sdk.js from dist/v1/sdk.js
            '/v1': resolve(__dirname, 'dist/v1')
        }
    }
});
