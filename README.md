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

    > npm install -g fquery@0.11.0

This will install fQuery and its command line tool `makejs`. Run `makejs --help` to see if everything
worked fine. To clone and build the project run the following commands.
You'll find a new directory `build` including a fresh zipball.

    > git clone git://github.com/lrsjng/h5ai.git
    > cd h5ai
    > makejs release


## License
The MIT License (MIT)

Copyright (c) 2014 Lars Jung (http://larsjung.de)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


## References
**h5ai** profits from these great projects:
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
