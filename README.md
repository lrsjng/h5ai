# h5ai

[![license][license-img]][gh] [![web][web-img]][web] [![github][gh-img]][gh]

A modern HTTP web server index for Apache httpd, lighttpd, nginx and Cherokee.
For bug reports and feature requests please use [issues][gh-issues].


## Install

Do **not** install any files from the `src` folder, they need to be
preprocessed to work correctly! Find a preprocessed package and detailed
install instructions on the [project page][web].


## Build

There are installation ready packages for the latest [releases][release] and
[dev builds][develop]. But if you want to build **h5ai** yourself you need to
install the build tool [fQuery][fquery] first:

    > npm install -g fquery@0.11.0

This will globally install fQuery and its command line tool `makejs`. Run
`makejs --help` to see if everything worked fine. To clone and build the
project run the following commands, this will create a new folder `build`
including a fresh zipball.

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
[GNOME&nbsp;Symbolic&nbsp;Icons](https://github.com/GNOME/gnome-icon-theme-symbolic)&nbsp;(CC BY-SA 3.0),
[HTML5&nbsp;★&nbsp;Boilerplate](http://html5boilerplate.com)&nbsp;(MIT),
[jQuery](http://jquery.com)&nbsp;(MIT),
[jQuery.fracs](http://larsjung.de/fracs/)&nbsp;(MIT),
[jQuery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel)&nbsp;(MIT),
[jQuery.qrcode](http://larsjung.de/qrcode/)&nbsp;(MIT),
[jQuery.scrollpanel](http://larsjung.de/scrollpanel/)&nbsp;(MIT),
[Lo-Dash](http://lodash.com)&nbsp;(MIT),
[marked](https://github.com/chjj/marked)&nbsp;(MIT),
[Modernizr](http://www.modernizr.com)&nbsp;(MIT/BSD),
[modulejs](http://larsjung.de/modulejs/)&nbsp;(MIT),
[Moment.js](http://momentjs.com)&nbsp;(MIT),
[Prism](http://prismjs.com)&nbsp;(MIT)


[web]: http://larsjung.de/h5ai/
[gh]: https://github.com/lrsjng/h5ai
[gh-issues]: https://github.com/lrsjng/h5ai/issues
[release]: http://release.larsjung.de/h5ai/
[develop]: http://release.larsjung.de/h5ai/develop/
[fquery]: http://larsjung.de/fquery/

[license-img]: http://img.shields.io/badge/license-MIT-a0a060.svg?style=flat-square
[web-img]: http://img.shields.io/badge/web-larsjung.de/h5ai-a0a060.svg?style=flat-square
[gh-img]: http://img.shields.io/badge/github-lrsjng/h5ai-a0a060.svg?style=flat-square
