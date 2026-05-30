import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimalPreset,
    maskable: {
      ...minimalPreset.maskable,
      padding: 0.2,
    },
  },
  images: ['public/icon.svg'],
});
