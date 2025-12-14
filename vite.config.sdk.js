import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

/**
 * Vite configuration for building the SDK bundle.
 * 
 * This creates a single IIFE (Immediately Invoked Function Expression) bundle
 * that can be embedded directly in client websites via a <script> tag.
 * 
 * Key decisions:
 * - IIFE format: Works without module bundlers on client sites
 * - Preact bundled inline: No external dependencies required
 * - Terser minification: Smallest possible bundle size
 * - ES2018 target: Broad browser support while using modern features
 */
export default defineConfig({
    plugins: [preact()],

    define: {
        // Preact production mode optimizations
        'process.env.NODE_ENV': JSON.stringify('production')
    },

    build: {
        lib: {
            entry: 'src/sdk/index.js',
            formats: ['iife'],
            name: 'PopupsSDK',
            fileName: () => 'sdk.js'
        },

        rollupOptions: {
            output: {
                // Ensure everything is bundled into one file
                inlineDynamicImports: true
            }
        },

        // Aggressive minification for smallest bundle
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,  // Keep console.error for debugging
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                properties: {
                    regex: /^_/
                }
            }
        },

        // Target modern browsers but maintain compatibility
        target: 'es2018',

        // Output to dist folder
        outDir: 'dist',

        // Don't empty outDir (in case we have multiple build configs)
        emptyOutDir: true,

        // Generate source maps for debugging (optional, can disable for production)
        sourcemap: false
    }
});
