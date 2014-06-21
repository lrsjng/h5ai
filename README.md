# h5ai
**h5ai** is a modern HTTP web server index for Apache httpd, lighttpd, nginx and Cherokee.
The preferred way to report a bug or make a feature request is to
create [a new issue](https://github.com/lrsjng/h5ai/issues/new) on GitHub!


## Install

**Note:** please don't use files from the `src` folder for installation,
they need to be preprocessed to work correctly!
You'll find a preprocessed package, as well as detailed installation
instructions on the [project page](http://larsjung.de/h5ai/).


## Build

There are repositories for the latest [releases](http://release.larsjung.de/h5ai/) and [dev builds](http://release.larsjung.de/h5ai/dev/).
But if you want to build **h5ai** yourself you need to install the build tool [fQuery](http://larsjung.de/fquery/) first:

    > npm install -g fquery

This will install fQuery and its command line tool `makejs`. Run `makejs --help` to see if everything
worked fine. To clone and build the project run the following commands.
You'll find a new directory `build` including a fresh zipball.

    > git clone git://github.com/lrsjng/h5ai.git
    > cd h5ai
    > makejs release


## License

**h5ai** is provided under the terms of the [MIT License](https://github.com/lrsjng/h5ai/blob/develop/LICENSE.md).

It profits from these great projects:
[Evolvere Icon Theme](http://franksouza183.deviantart.com/art/Evolvere-Icon-theme-440718295)&nbsp;(CC BY-NC-ND 3.0),
[Faenza Icons](http://tiheum.deviantart.com/art/Faenza-Icons-173323228)&nbsp;(GPL),
[Gnome Symbolic Icon Theme](https://git.gnome.org/browse/gnome-icon-theme-symbolic/)&nbsp;(CC BY-SA 3.0),
[HTML5 ★ Boilerplate](http://html5boilerplate.com)&nbsp;(MIT),
[jQuery](http://jquery.com)&nbsp;(MIT),
[jQuery.fracs](http://larsjung.de/fracs/)&nbsp;(MIT),
[jQuery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel)&nbsp;(MIT),
[jQuery.qrcode](http://larsjung.de/qrcode/)&nbsp;(MIT),
[jQuery.scrollpanel](http://larsjung.de/scrollpanel/)&nbsp;(MIT),
[markdown-js](https://github.com/evilstreak/markdown-js)&nbsp;(MIT),
[Modernizr](http://www.modernizr.com)&nbsp;(MIT/BSD),
[modulejs](http://larsjung.de/modulejs/)&nbsp;(MIT),
[Moment.js](http://momentjs.com)&nbsp;(MIT),
[SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/)&nbsp;(MIT/GPL),
[Underscore.js](http://underscorejs.org)&nbsp;(MIT)
