# Contribution Guideline
##  Branching Workflow 
This document consist of a proposed git branching model.

## Semantic Versioning
All the projects should be updated w.r.t to semantic versioning standards to properly keep track of the project. To refer more about semver versioning kindly refer this [link](https://semver.org/).

## Mandatory Branches
For every project there should be two main branches
- master
- develop

### Master Branch

The master branch at origin should be familiar to every Git user. Parallel to the master branch, another branch exists called develop.We consider origin/master to be the main branch where the source code of HEAD always reflects a production-ready state.This branch should only be updated with a tagged version from develop branch when you feel that the develop branch is stable enough.The developers should not be allowed to directly push changes to this branch.
Only latest tagged version should be updated via merge requests.

### Develop Branch

We consider origin/develop to be the main branch where the source code of HEAD always reflects a state with the latest delivered development changes for the next release.When the source code in the develop branch reaches a stable point and is ready to be released, all of the changes should be merged back into master somehow and then tagged with a release number.This also can be done by introducing a new release branch from the develop and you can do the release specific changes into the release branch(More on release branch below) and finally merged back into master and develop.Therefore, each time when changes are merged back into master, this is a new production release by definition. We tend to be very strict at this, so that theoretically, we could use a Git hook script to automatically build and roll-out our software to our production servers everytime there was a commit on master

## Supporting Branches

These are the different supporting branches which we recommend to make use
- Feature Branches
- Bugfix Branches
- Hotfix Branches
- Release Branches

Before doing the intended changes for feature/bugfix/hotfix, it is recommended to create an issue and discuss the changes with project maintainers/developers before proceeding with development.
Also the issue should be referenced in the merge request.

### Feature Branches

For developing a new feature / functionality, a branch named `feature-*` (eg feature-add-user) should be made used which should be branched off from the latest `origin/develop` branch. After the feature development is completed, It should be merged via a pull request (or merge request in gitlab) where the code is reviewed by another developer than who wrote the code.

### Bugfix Branches

For fixing a bug in develop branch, a branch named `bugfix-*` (eg bugfix-login-api) should be made used which should be branched off from the latest `origin/develop` branch. After the bugfix is completed, It should be merged via a pull request (or merge request in gitlab) where the code is reviewed by another developer than who wrote the code.

### Hotfix Branches

For fixing a bug in master branch which is in production, a branch named `hotfix-*` (eg bugfix-login-api) should be made used which should be branched off from the latest `origin/master` branch. After the hotfix is completed, It should be merged via a pull request (or merge request in gitlab) where the code is reviewed by another developer than who wrote the code to master branch for immediate correction, which would be picked up by CI pipeline ideally and released into production.The same change should also be made in develop branch.

### Release Branches

When the requirments for the next release is complete and merged into develop branch,  a branch named `release-*` (eg release-1.1.0) could be made should be branched off from the latest `origin/develop` branch After making release specific changes (Eg: updating version numbers) before the next verion.When a release branch is created, develop branch should no longer accept pull requests  and all the changes, bugfixes etc should be made against the release branch.After the release requirements are met, you can tag the version and release it.It should be merged back to both develop and master branch and you can resume developing against the develop branch.The developers should not be allowed to directly push changes to this branch.

## Making use of Labels to refer issues and merge requests

Approriate labels should be assigned to each issue and pull request. Appropriate label names can be made according to the project needs. Eg (Bug-priority-high, UI/UX)
