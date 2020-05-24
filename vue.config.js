module.exports = {
  pluginOptions: {
    electronBuilder: {
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      mainProcessFile: 'src/background.ts',
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
      entry: 'src/renderer/main.ts',
      template: 'public/index.html',
    },
  },
};
