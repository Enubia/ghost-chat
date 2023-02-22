# Contributing to GHOST-CHAT

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## All Code Changes Happen Through Pull Requests

### Prerequisites

Make sure you have ```npm``` version 7+ installed since this will automatically install peer dependencies.
The ```.vscode``` directory contains and extensions.json file which has 3 recommended extensions in it. Please install them.

This project makes heavy use of [typescript](https://www.typescriptlang.org/), so if you aren't familiar with it yet please check it out.

All the code for the views is located in the ```src/renderer``` directory and electron specific setups are done in the ```src/electron``` directory.

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `master`.
2. Run ```npm install``` (this might take some time on the first run since it needs to download the electron binaries).
3. ```npm start``` will startup the project locally.
4. If you're done making your changes: ```npm run electron:build```, this will create a production executable.
5. Run the recently built executable and verify that everything is still working as expected. (it is located in the newly generated ```dist_electron``` directory)
6. If everything is fine, increase the version number in ```package.json```. Take a look at [https://semver.org/](https://semver.org/) if you are not sure how to version your changes.
7. Make sure your code lints.
8. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/enubia/ghost-chat/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

People _love_ thorough bug reports. I'm not even kidding.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Code Style

- We use [prettier](https://www.npmjs.com/package/prettier) and [eslint](https://www.npmjs.com/package/eslint) for code styling.
- General code style rules include:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "useTabs": false,
  "endOfLine": "lf",
  "tabWidth": 2,
  "trailingComma": "all",
  "semi": true
}
```

- We configured commit hooks which will be run once you commit your code (done via [husky](https://www.npmjs.com/package/husky))

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
