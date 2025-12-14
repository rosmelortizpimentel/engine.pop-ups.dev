import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

/**
 * Vite configuration for local development.
 * Serves the dev/index.html test page with HMR.
 */
export default defineConfig({
    plugins: [preact()],

    root: 'dev',

    server: {
        port: 5173,
        open: true
    }
});
