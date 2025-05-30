import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [react()],
    define: {
      // Only expose specific environment variables here. Add more as needed.
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      // Example: 'process.env.MY_VAR': JSON.stringify(env.MY_VAR)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    server: {
      port: 3000,
      strictPort: true
    }
  };
});
