import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron';

  const config: Record<string, any> = {
    plugins: [react()],
    resolve: {
      alias: {
        '@model': path.resolve(__dirname, 'src/model'),
        '@parser': path.resolve(__dirname, 'src/parser'),
        '@generator': path.resolve(__dirname, 'src/generator'),
        '@canvas': path.resolve(__dirname, 'src/canvas'),
        '@editor': path.resolve(__dirname, 'src/editor'),
        '@sync': path.resolve(__dirname, 'src/sync'),
        '@palette': path.resolve(__dirname, 'src/palette'),
        '@main': path.resolve(__dirname, 'src/main'),
        '@renderer': path.resolve(__dirname, 'src/renderer'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
    },
  };

  if (isElectron) {
    config.plugins.push(
      electron([
        {
          entry: 'src/main/main.ts',
          onstart(options) {
            options.startup(['--no-sandbox']);
          },
          vite: {
            build: {
              outDir: 'dist-electron/main',
              emptyOutDir: true,
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
        {
          entry: 'src/preload/preload.ts',
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              emptyOutDir: true,
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
      ]),
      electronRenderer()
    );
  }

  return config;
});
