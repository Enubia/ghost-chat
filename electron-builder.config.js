/* eslint-disable no-template-curly-in-string */
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
    productName: 'Ghost-Chat',
    appId: 'com.github.enubia.ghost-chat',
    asar: true,
    directories: {
        output: 'release/${version}',
    },
    files: [
        'dist-electron',
        'dist',
    ],
    mac: {
        artifactName: '${productName}-${version}-mac.${ext}',
        target: 'default',
        publish: ['github'],
    },
    win: {
        artifactName: '${productName}-${version}-win.${ext}',
        target: 'nsis',
        publish: ['github'],
    },
    // "linux": {
    //     "artifactName": "${productName}-${version}-linux.${ext}",
    //     "target": ["AppImage"],
    //     "publish": ["github"],
    //     "desktop": {
    //         "Name": "GhostChat",
    //         "Terminal": false
    //     }
    // },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
    },
};
