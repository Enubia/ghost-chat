module.exports = {
  pluginOptions: {
    electronBuilder: {
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      mainProcessFile: 'src/electron/background.js',
      builderOptions: {
        appId: 'test.com',
        win: {
          icon: 'public/favicon.ico',
        },
        mac: { icon: 'public/favicon.ico' },
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
