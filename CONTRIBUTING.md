Contributing to GhostChat
=========================================

Feel free to submit issues and enhancement requests.

Please use [issues](https://github.com/Enubia/ghost-chat/issues/new/choose) or the [Discord](https://discord.gg/UVMX32dDcy) to report bugs and errors.

Contributing
------------

Please refer to the project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

 1. **Fork** the repo on GitHub
 2. **Clone** the project to your own machine
 3. **Commit** changes to your own branch
 4. **Push** your work back up to your fork
 5. Submit a **Pull request** so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!

Setup
-----------------------

Prerequisites:
   - Ensure that [pnpm](https://pnpm.io/) is installed
   - The node version used to run and build the project is set to v18.4.2

Install dependencies with `pnpm install`

GitHooks are executed on commit. This means linting the project before a commit can be created. This process also runs on github to ensure that the styling guidelines are met and no build errors are produced.

Once the pull-request is created, all the pipelines need to succeed in order to be able to be merged into master. If any of them fail you'll need to fix the issues before.