import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var frontendPort = Number(env.FRONTEND_PORT || env.PORT || 11111);
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: frontendPort,
            allowedHosts: ['www.sieuthithuocadk.com', 'sieuthithuocadk.com'],
            proxy: {
                '/api': {
                    target: 'https://www.sieuthithuocadk.com',
                    changeOrigin: true,
                },
            },
        },
        preview: {
            host: '0.0.0.0',
            port: frontendPort,
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Vendor chunks - split large dependencies
                        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                        'vendor-query': ['@tanstack/react-query'],
                        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
                        'vendor-motion': ['framer-motion'],
                        'vendor-utils': ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                    },
                },
            },
            // Optimize chunk size
            chunkSizeWarningLimit: 300,
            // Use esbuild for minification (default, faster)
            minify: 'esbuild',
            // Target modern browsers for smaller bundle
            target: 'es2020',
        },
        // Optimize dependencies
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'framer-motion'],
        },
    };
});
