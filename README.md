# h5ai

[![license][license-img]][github] [![web][web-img]][web] [![github][github-img]][github]

A modern HTTP web server index for Apache httpd, lighttpd, nginx and Cherokee.
For bug reports and feature requests please use [issues][github-issues].


## Install

Do **not** install any files from the `src` folder, they need to be
preprocessed to work correctly! Find a preprocessed package and detailed
install instructions on the [project page][web].


## Build

There are installation ready packages for the latest [releases][release] and
[dev builds][develop]. But to clone and build **h5ai** yourself run the
following commands to find a fresh zipball in folder `build` (tested on linux
only, requires [`git`][git] and [`npm`][npm] to be installed).

    > git clone git://github.com/lrsjng/h5ai.git
    > cd h5ai
    > npm install
    > npm run build


## License

The MIT License (MIT)

Copyright (c) 2015 Lars Jung (http://larsjung.de)

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

**h5ai** profits from other projects, all of them licensed under the MIT license
too. Exceptions are the [Material Design icons][material-design-icons] (CC BY 4.0).


[web]: http://larsjung.de/h5ai/
[github]: https://github.com/lrsjng/h5ai
[github-issues]: https://github.com/lrsjng/h5ai/issues
[release]: http://release.larsjung.de/h5ai/
[develop]: http://release.larsjung.de/h5ai/develop/
[git]: http://git-scm.com
[npm]: https://www.npmjs.org
[material-design-icons]: https://github.com/google/material-design-icons

[license-img]: http://img.shields.io/badge/license-MIT-a0a060.svg?style=flat-square
[web-img]: http://img.shields.io/badge/web-larsjung.de/h5ai-a0a060.svg?style=flat-square
[github-img]: http://img.shields.io/badge/github-lrsjng/h5ai-a0a060.svg?style=flat-square
