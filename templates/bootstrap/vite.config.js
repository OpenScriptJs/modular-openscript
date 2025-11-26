import { defineConfig } from 'vite';
import { openScriptComponentPlugin } from '../..';

export default defineConfig({
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    },
    plugins: [
        openScriptComponentPlugin({
            componentsDir: 'src/components',
            autoRegister: true,
            generateTypes: true
        })
    ]   
});
