![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)
![David](https://img.shields.io/david/Enubia/ghost-chat?style=flat-square)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/enubia/ghost-chat?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/enubia/ghost-chat?style=flat-square)
![GitHub All Releases](https://img.shields.io/github/downloads/enubia/ghost-chat/total?color=brightgreen&style=flat-square)
[![](https://img.shields.io/twitch/status/enubia1?color=%23a85fff&style=flat-square)](https://www.twitch.tv/enubia1)

# Ghost Chat

Ghost chat is a standalone [Twitch.tv](https://www.twitch.tv) chat as overlay on windowed/windowed full screen applications written in Electron and Vue.

It lets you connect to a channel without the need of opening twitch in your browser which comes in handy if you happen to have only one monitor,
or you just want to have your chat on your main screen.

## Installation / Usage

- Download the latest release (installer or standalone) from [https://github.com/Enubia/ghost-chat/releases](https://github.com/Enubia/ghost-chat/releases).
- The first time you launch it on Windows, `Windows protected your PC` will appear. This is due to the fact that Windows Defender Smart Screen can't find the code signing certificate. Just click `More info` and then `Run anyway`. You'll only have to do this once.
- After launching the application, enter the channel you want to receive chat messages from and click go / press enter.
- You can move the window around by clicking and dragging the top section where minimize and close buttons are.
- If you want to resize it, just click and drag the borders to whatever size you want.

![png](images/index.png)

- Settings can be reached through the context menu.

![png](images/settings.png)

- Chat window

![png](images/chatShowcase.png)

- With a click on the ghost, you'll set the window to transparent, remove the borders and make it click through. This can be reverted by clicking `Revert Click through` in the tray icon menu.

![png](images/ghostbutton.png)

- result

![png](images/transparentShowcase.png)

## Additional info

If you have any suggestions for features, or you've found a bug, feel free to go to [https://github.com/Enubia/ghost-chat/issues/new/choose](https://github.com/Enubia/ghost-chat/issues/new/choose).

# Contributing

Please refer to our [contributing guidlines](CONTRIBUTING.md).
