module.exports = {
  purge: {
    enabled: true,
    content: [
      './public/*.html',
      './src/renderer/*.vue',
      './src/renderer/**/*.vue',
      './src/renderer/**/**/*.vue',
    ],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
