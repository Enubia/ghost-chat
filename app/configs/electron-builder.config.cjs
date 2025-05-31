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
        output: 'out/release/${version}',
    },
    files: ['out/dist-electron', 'out/dist'],
    mac: {
        artifactName: '${productName}-${arch}.${ext}',
        target: {
            target: 'default',
            arch: ['x64', 'arm64'],
        },
        publish: ['github'],
    },
    win: {
        artifactName: '${productName}.${ext}',
        target: 'nsis',
        publish: ['github'],
    },
    // "linux": {
    //     "artifactName": "${productName}-linux.${ext}",
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
