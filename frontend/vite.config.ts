import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            // Whether to polyfill `global`
            protocolImports: true,
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3000'
        }
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                modifyVars: {
                    'primary-color': '#9945FF',
                    'link-color': '#9945FF',
                    'border-radius-base': '6px',
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    define: {
        'process.env': {},
    },
    optimizeDeps: {
        include: ['buffer'],
    },
});
