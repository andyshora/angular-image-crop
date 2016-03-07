The stylesheet of **angular-image-crop** is written in [LESS](http://lesscss.org/).

#Setup
1. [Fork this project](https://help.github.com/articles/fork-a-repo) and clone it on your system.
2. Create a new branch out off `master` for your fix/feature. `git checkout new-feature master`

#Building

**angular-image-crop.js** and **angular-image-crop.css** uses [Grunt](http://gruntjs.com/) for the build process which you need to have installed on your system.

Also there are four additional Grunt tasks required to build the library:

1. [grunt-contrib-copy](https://npmjs.org/package/grunt-contrib-copy)

2. [grunt-contrib-less](https://www.npmjs.com/package/grunt-contrib-less)

3. [grunt-contrib-uglify](https://www.npmjs.com/package/grunt-contrib-uglify)

4. [grunt-contrib-watch](https://www.npmjs.com/package/grunt-contrib-watch)

To install all the dependencies, run `npm install`.

Once you have the dependencies installed, run `grunt` from the project directory. This will run the default grunt task which compiles the files in `src` folder and stores them (and their minified forms) into `dist` folder.

#Things to remember
- Before submitting a patch, rebase your branch on upstream `master` to make life easier for the merger/author.

- **DO NOT** add the final build files (compiled in `dist` folder) into your commits. It will be compiled again and updated later, once your patch has been merged by the merger/author.