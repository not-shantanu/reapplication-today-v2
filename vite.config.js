import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { env } from './src/config/env';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    middleware: [
      (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        next();
      },
    ],
  },
  define: {
    'process.env': Object.fromEntries(
      Object.entries(env).map(([key, value]) => [key, JSON.stringify(value)])
    )
  }
});
