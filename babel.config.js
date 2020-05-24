module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],

  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          '@': './src/renderer',
        },
      },
    ],
  ],
};
