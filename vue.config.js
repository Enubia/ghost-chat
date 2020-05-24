module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/electron/background.js',
      builderOptions: {
        appId: 'test.com',
        win: {
          icon: 'public/favicon.ico',
        },
      },
    },
  },

  pages: {
    index: {
      entry: 'src/renderer/main.js',
      template: 'public/index.html',
    },
  },
};
