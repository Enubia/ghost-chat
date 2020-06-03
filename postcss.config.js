/* eslint-disable @typescript-eslint/no-var-requires */
const postcssPurgecss = require('@fullhuman/postcss-purgecss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

const purgecss = postcssPurgecss({
  // Specify the paths to all of the template files in your project.
  content: ['./public/**/*.html', './src/**/*.vue'],
  // Include any special characters you're using in this regular expression.
  // See: https://tailwindcss.com/docs/controlling-file-size/#understanding-the-regex
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  // Whitelist auto generated classes for transitions and router links.
  // From: https://github.com/ky-is/vue-cli-plugin-tailwind
  whitelistPatterns: [
    /-(leave|enter|appear)(|-(to|from|active))$/,
    /^(?!(|.*?:)cursor-move).+-move$/,
    /^router-link(|-exact)-active$/,
  ],
});

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
