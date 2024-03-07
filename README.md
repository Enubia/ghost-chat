<p align="center">
  <a href="https://github.com/Enubia/ghost-chat/releases/latest">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/enubia/ghost-chat?style=for-the-badge">
  </a>
  <a href="https://github.com/Enubia/ghost-chat/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/enubia/ghost-chat?style=for-the-badge">
  </a>
  <a href="https://discord.gg/UVMX32dDcy" target="_blank">
    <img alt="Discord" src="https://img.shields.io/discord/1078447787252916234?color=%237289DA&label=DISCORD&style=for-the-badge">
  </a>
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/enubia" target="_blank">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" width="200">
  </a>
  <a href="https://www.paypal.com/donate/?hosted_button_id=RQFDVMBP397KG">
    <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="Donate with PayPal" width="145" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/Enubia/ghost-chat/releases/latest/download/Ghost-Chat-2.7.0-win.exe" target="_blank">
    <img src="./markdown-images/windows-button.png" alt="Buy Me A Coffee" width="350" >
  </a>
  <a href="https://github.com/Enubia/ghost-chat/releases/latest/download/Ghost-Chat-2.7.0-mac.dmg">
    <img src="./markdown-images/mac-download-button.png" alt="Donate with PayPal" width="350" />
  </a>
</p>

---

# Ghost Chat

Ghost chat is a standalone, multi-platform [Twitch.tv](https://www.twitch.tv) chat as an overlay on windowed/windowed full-screen applications written in Typescript with the help of Electron and Vue.

It lets you connect to a channel without the need to open Twitch in your browser which comes in handy if you happen to have only one monitor,
or you want to have your chat on your main screen.

## Installation / Usage

A detailed description can be found in our discord server's faq section.

<p align="center">
  <a href="https://discord.gg/UVMX32dDcy"><img src="https://discordapp.com/api/guilds/1078447787252916234/widget.png?style=banner2" alt="Discord server"></a>
</p>

## Additional info

### Translators needed
Since GhostChat uses i18n, it's easy to add new language support, but I need you as a community.
So if you are a native speaker of a language that is not yet included you can check [en-US.json](/i18n/locales/en-US.json) and create a new file in this directory with the language id as the name.

A reference to what the key should look like can be found [here](/src/components/languageMappingList.ts).

Just search for your language and choose the key as the filename for the JSON file.
If the file already exists and it's just missing some translations you'd like to add then please add them in there, otherwise copy over the parts of en-US.json that you want to translate and replace the English text with your language-specific translations.

Once you are done with the translations, create a PR here on GitHub or post them in the #feature-request channel so that we can add them.

If you have any other suggestions for features, or you've found a bug, feel free to go to create an issue/new feature request either [here on github](https://github.com/Enubia/ghost-chat/issues/new/choose) or in [Discord](https://discord.gg/UVMX32dDcy).

# Contributing

Please refer to our [contributing guidelines](CONTRIBUTING.md).

## Star History

<p align="center">
    <a href="https://star-history.com/#enubia/ghost-chat&Date">
        <picture>
            <source media="(prefers-color-scheme: dark)"
                srcset="https://api.star-history.com/svg?repos=enubia/ghost-chat&type=Date&theme=dark" />
            <source media="(prefers-color-scheme: light)"
                srcset="https://api.star-history.com/svg?repos=enubia/ghost-chat&type=Date" />
            <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=enubia/ghost-chat&type=Date" />
        </picture>
    </p>
</a>
