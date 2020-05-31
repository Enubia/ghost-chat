# Introduction
Ghost chat is a standalone Twitch chat application written in Electron and Vue.
It lets you connect to a channel without the need of opening twitch in your browser which comes in handy if you happen to have only one monitor,
or you just want to have your chat on your main screen.

# How it works

Nothing special required, just download the application from the [release](https://github.com/LettuceKiing/ghost-chat/releases) page and install it.
Available on windows, mac and linux.

![gif](markdown-stuff/example.gif)

# Development setup


Clone/Download this repo

in the root directory
```bash 
npm install
```

to start the development server with hot reload enabled
```bash 
npm run electron:serve
```

if you want to build it for production run 
```bash
npm run electron:build
```

Electron will build it for your current OS which you are running this script from.



