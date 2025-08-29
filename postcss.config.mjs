/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {
      // Disable LightningCSS to avoid binary compatibility issues on Vercel
      lightningcss: false,
    },
  },
};

export default config;
