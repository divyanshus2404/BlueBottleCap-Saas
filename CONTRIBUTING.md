# Contributing to BlueBottleCap SaaS

First off, thank you for considering contributing to BlueBottleCap SaaS! It's people like you that make open source such a fantastic community to learn, inspire, and create.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) first to see if someone else has already created it. If not, feel free to open a new issue using our templates!

## Fork & create a branch

If this is something you think you can fix, then fork BlueBottleCap SaaS and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-ai-model
```

## Get the test suite running

Make sure you're using Node.js. 

```sh
npm install
npm run dev
```

## Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first. 

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with BlueBottleCap SaaS's master branch:

```sh
git remote add upstream https://github.com/divyanshus2404/BlueBottleCap-Saas.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-new-ai-model
git rebase master
git push --set-upstream origin 325-add-new-ai-model
```

Finally, go to GitHub and make a Pull Request! Please use the provided PR template.
