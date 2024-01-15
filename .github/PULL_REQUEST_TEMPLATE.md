<!-- Thank you for contributing! -->

### Description
<!-- Please insert your description here and provide especially info about the "what" this PR is solving -->
- https://github.com/Enubia/ghost-chat/issues/762 global hotkey assignment
added the requested Feature.
- Settings->General added the Keybind Option with a Save Button. Pressing the Button considers the states of the current Vanish. 
- There is a refactor of the existing IPC Event to be mindful of the state, it now works like a switch.
- Feature was added to existing files, specifically in the electron files background, store, ipcevents, constants events, constants store, types store. In Vue files it is general and settings.

### What is the purpose of this pull request? <!-- (put an "X" next to an item) -->

- [ ] Bug fix
- [x] New Feature
- [ ] Documentation update
- [ ] Other
