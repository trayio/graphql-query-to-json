npm run lintFull
rm -rf dist/
npm run build
npm version patch
git push --tags
npm publish
