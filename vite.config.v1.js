import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

/**
 * Vite configuration for building SDK v1 bundle.
 * 
 * Output: dist/v1/sdk.js
 * CDN URL: cdn.toggleup.io/v1/sdk.js
 */
export default defineConfig({
    plugins: [preact()],

    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        '__SDK_VERSION__': JSON.stringify('1.0.0')
    },

    build: {
        lib: {
            entry: 'src/v1/sdk/index.js',
            formats: ['iife'],
            name: 'ToggleupSDK',
            fileName: () => 'sdk.js'
        },

        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        },

        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: {
                    regex: /^_/
                }
            }
        },

        target: 'es2018',
        outDir: 'dist/v1',
        emptyOutDir: true,
        sourcemap: false
    }
});
