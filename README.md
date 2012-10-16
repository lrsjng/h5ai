# h5ai
**a modern HTTP web server index for Apache httpd, lighttpd, nginx and Cherokee**

The preferred way to report a bug or make a feature request is to
create [a new issue](http://github.com/lrsjng/h5ai/issues/new) on GitHub!


## Install

(**note:** please don't use files from the `src` folder for installation,
they need to be preprocessed to work correctly)

You'll find a preprocessed package, as well as detailed installation
instructions on the [project page](http://larsjung.de/h5ai/).


## Build

(there are repositories of the latest [releases](http://release.larsjung.de/h5ai/) and [dev builds](http://release.larsjung.de/h5ai/dev/))

If you want to build **h5ai** yourself you need to install the build tool [fQuery](http://larsjung.de/fquery/) first:

    > npm install -g fquery

This will install fQuery and its command line tool `makejs`. Run `makejs --help` to see if everything
worked fine.

To clone and build the project run the following commands.
You'll find a new directory `build` including a fresh zipball.

    > git clone git://github.com/lrsjng/h5ai.git
    > cd h5ai
    > makejs release


## License

**h5ai** is provided under the terms of the [MIT License](http://github.com/lrsjng/h5ai/blob/develop/LICENSE.md).

It profits from these great projects:
[Faenza icon set](http://tiheum.deviantart.com/art/Faenza-Icons-173323228)&nbsp;(GPL),
[HTML5 ★ Boilerplate](http://html5boilerplate.com)&nbsp;(MIT),
[jQuery](http://jquery.com)&nbsp;(MIT),
[jQuery.filedrop](http://www.github.com/weixiyen/jquery-filedrop)&nbsp;(MIT),
[jQuery.fracs](http://larsjung.de/fracs/)&nbsp;(MIT),
[jQuery.mousewheel](http://github.com/brandonaaron/jquery-mousewheel)&nbsp;(MIT),
[jQuery.qrcode](http://larsjung.de/qrcode/)&nbsp;(MIT),
[jQuery.scrollpanel](http://larsjung.de/scrollpanel/)&nbsp;(MIT),
[markdown-js](http://github.com/evilstreak/markdown-js)&nbsp;(MIT),
[Modernizr](http://www.modernizr.com)&nbsp;(MIT/BSD),
[modulejs](http://larsjung.de/modulejs/)&nbsp;(MIT),
[Moment.js](http://momentjs.com)&nbsp;(MIT),
[spin.js](http://fgnass.github.com/spin.js/)&nbsp;(MIT),
[SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/)&nbsp;(MIT/GPL),
[Underscore.js](http://underscorejs.org)&nbsp;(MIT)


## Changelog
(**h5ai** uses [semantic versioning](http://semver.org/))

### v0.22.1 - *2012-10-16*

* bug fix concerning API requests in PHP mode
* minor changes in responsive styles


### v0.22 - *2012-10-14*

* general changes h5ai directory layout and configuration
* splits configuration file (`config.json`) into files `options.json`, `types.json` and `langs.json`
* localization now in separate files
* adds auto-refresh
* adds drag'n'drop upload (PHP, experimental)
* adds file deletion (PHP, experimental)
* cleans and improves PHP code
* PHP no longer respects htaccess restrictions (so be careful)
* PHP ignore patterns might include paths now
* improves separation between aai and php mode
* improves performance in aai mode
* adds optional binary prefixes for file sizes
* improves filter: autofocus on keypress, clear on `ESC`
* download packages now packaged relative to current folder
* download package name changable
* splits type `js` into `js` and `json`
* prevents some errors with files > 2GB on 32bit OS
* adds max subfolder size in tree view
* adds ctrl-click file selection
* adds Piwik analytics extension
* temp download packages are now stored in the `cache`-folder and deleted as soon as possible
* updates translations
* adds `he` translation by [Tomer Cohen](https://github.com/tomer)
* updates 3rd party libs


### v0.21 - *2012-08-06*

* fixes misaligned image previews
* adds no JavaScript fallback to PHP version
* fixes duplicate tree entries and empty main views
* adds Google Analytics support (async)
* improves filter (now ignorecase, now only checks if chars in right order)
* adds keyboard support to image preview (space, enter, backspace, left, right, up, down, f, esc)
* adds text file preview and highlighting with [SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/) (same keys as img preview)
* adds Markdown preview with [markdown-js](http://github.com/evilstreak/markdown-js)
* adds new type `markdown`
* changes language code `gr` to `el`
* adds localization for filter placeholder
* adds `hu` translation by [Rodolffo](http://github.com/Rodolffo)
* updates to [jQuery.qrcode](http://larsjung.de/qrcode/) 0.2
* updates to [jQuery.scrollpanel](http://larsjung.de/scrollpanel/) 0.1
* updates to [modulejs](http://larsjung.de/modulejs/) 0.2
* updates to [Moment.js](http://momentjs.com) 1.7.0
* updates to [Underscore.js](http://underscorejs.org) 1.3.3


### v0.20 - *2012-05-11*

* adds image preview
* adds thumbnails for video and pdf
* adds support for lighttpd, nginx and cherokee and maybe other webservers with PHP
* adds folder size in PHP version via shell `du`
* fixes some localization problems
* updates info page at `/_h5ai/`
* switches to JSHint


### v0.19 - *2012-04-19*

* adds lots of config options
* changes in `config.js` and `h5ai.htaccess`
* fixes js problems in IE 7+8
* hides broken tree view in IE < 9, adds a message to the footer
* removes hash changes since they break logical browser history
* fixes thumbnail size for portrait images in icon view
* fixes problems with file type recognition
* adds an info page at `/_h5ai/`
* sort order is preserved while browsing
* removes PHP error messages on thumbnail generation
* fixes PHP some problems with packed download
* adds support for tarred downloads
* changes crumb image for folders with an index file
* adds `index.php` to use h5ai in non-Apache environments
* switches from [Datejs](http://www.datejs.com) to [Moment.js](http://momentjs.com)
* adds [underscore.js](http://underscorejs.org)
* fixes mousewheel problems, updates [jQuery.mousewheel](http://github.com/brandonaaron/jquery-mousewheel) to 3.0.6
* updates `lv` translation
* adds `ro` translation by [Jakob Cosoroabă](http://github.com/midday)
* adds `ja` translation by [metasta](http://github.com/metasta)
* adds `nb` translation by [Sindre Sorhus](http://github.com/sindresorhus)
* adds `sr` translation by [vBm](http://github.com/vBm)
* adds `gr` translation by [xhmikosr](http://github.com/xhmikosr)


### v0.18 - *2012-02-24*

* adds optional QRCode display
* adds optional filtering for displayed files and folders
* updates design
* improves zipped download
* adds support for zipped download of htaccess restricted files
* changes h5ai.htaccess
* custom headers/footers are now optional and disabled by default
* fixes problems with folder recognition in the JS version
* fixes include problems in PHP version
* fixes path problems on servers running on Windows in PHP version
* fixes broken links in custom headers/footers while zipped download enabled
* fixes problems with thumbnails for files with single or double quotes in filename
* improves url hashes
* updates year in `LICENSE.TXT`
* updates es translation
* adds `zh-tw` translation by [Yao Wei](http://github.com/medicalwei)
* updates `zh-cn` translation


### v0.17 - *2011-11-28*

* h5ai is now located in `_h5ai` to reduce collisions
* switches from HTML5 Boilerplate reset to normalization
* adds some style changes for small devices
* configuration (options, types, translations) now via `config.js`
* icons for JS version are now configured via `config.js`
* sort order configuration changed
* sorting is now done without page reload
* adds `customHeader` and `customFooter` to `config.js`
* supports restricted folders to some extent
* some style changes on tree and language menu
* fixes total file/folder count in status bar
* adds support for use with userdir (requires some manual changes)


### v0.16 - *2011-11-02*

* sorts translations in `options.js`
* improves HTML head sections
* refactors JavaScript and PHP a lot
* improves/fixes file selection for zipped download
* fixes scrollbar and header/footer link issues (didn't work when zipped download enabled)
* adds support for ctrl-select
* `dateFormat` in `options.js` changed, now affecting JS and PHP version
* `dateFormat` is localizable by adding it to a translation in `options.js`
* PHP version is now configurable via `php/config.php` (set custom doc root and other PHP related things)
* image thumbs and zipped download is disabled by default now, but works fine if PHP is configured


### v0.15.2 - *2011-09-18*

* adds `it` translation by [Salvo Gentile](http://github.com/SalvoGentile) and [Marco Patriarca](http://github.com/Fexys)
* switches build process from scripp to wepp


### v0.15.1 - *2011-09-06*

* fixes security issues with the zipped download feature
* makes zipped download optional (but enabled by default)


### v0.15 - *2011-09-04*

* adds zipped download for selected files
* cleans and refactores


### v0.14.1 - *2011-09-01*

* display meta information in bottom bar (icon view)
* adds `zh-cn` translation by [Dongsheng Cai](http://github.com/dongsheng)
* adds `pl` translation by Radosław Zając
* adds `ru` translation by Богдан Илюхин


### v0.14 - *2011-08-16*

* adds image thumbnails for PHP version
* new option `slideTree` to turn off auto slide in


### v0.13.2 - *2011-08-12*

* changes in `/h5ai/.htaccess` ... PHP configuration ...


### v0.13.1 - *2011-08-12*

* fixes initial tree display
* adds sort order option
* adds/fixes some translations
* adds `lv` translation by Sandis Veinbergs


### v0.13 - *2011-08-06*

* adds PHP implementation! (should work with PHP 5.2+)
* adds new options
* changes layout of the bottom bar to display status information
* adds language selector to the bottom bar
* quotes keys in `options.js` to make it valid json
* changes value of option `lang` from `undefined` to `null`
* adds some new keys to `h5aiLangs`
* adds browser caching rules for css and js
* adds `pt` translation by [Jonnathan](http://github.com/jonnsl)
* adds `bg` translation by George Andonov


### v0.12.3 - *2011-07-30*

* adds `tr` translation by [Batuhan Icoz](http://github.com/batuhanicoz)


### v0.12.2 - *2011-07-30*

* adds `es` translation by Jose David Calderon Serrano


### v0.12.1 - *2011-07-29*

* fixes unchecked use of console.log


### v0.12 - *2011-07-28*

* improves performance


### v0.11 - *2011-07-27*

* changes license to MIT license, see `LICENSE.txt`


### v0.10.2 - *2011-07-26*

* improves tree scrollbar


### v0.10.1 - *2011-07-24*

* fixes problems with ' in links


### v0.10 - *2011-07-24*

* fixes problems with XAMPP on Windows (see `dot.htaccess` comments for instructions)
* fixes tree fade-in-fade-out effect for small displays ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* adds custom scrollbar to tree ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* fixes broken links caused by URI encoding/decoding ([issue #9](http://github.com/lrsjng/h5ai/issues/9))
* adds "empty" to localization (hope Google Translate did a good job here)


### v0.9 - *2011-07-18*

* links hover states between crumb, extended view and tree
* fixes size of tree view (now there's a ugly scrollbar, hopefully will be fixed)
* refactores js to improve performance and cleaned code
* adds caching for folder status codes and content
* adds `fr` translation by [Nicolas](http://github.com/Nicosmos)
* adds `nl` translation by [Stefan de Konink](http://github.com/skinkie)
* adds `sv` translation by Oscar Carlsson


### v0.8 - *2011-07-08*

* removes slashes from folder labels
* optionally rename parent folder entries to real folder names, see `options.js`
* long breadcrumbs (multiple rows) no longer hide content
* error folder icons are opaque now
* refactores js a lot (again...)


### v0.7 - *2011-07-07*

* removes shadows
* smarter tree side bar


### v0.6 - *2011-07-05*

* refactores js
* adds localization, see `options.js`


### v0.5.3 - *2011-07-04*

* refactores js
* adds basic options support via `options.js`
* adds comments to `options.js`
* adds optional tree sidebar


### v0.5.2 - *2011-07-02*

* details view adjusts to window width
* links icon for *.gz and *.bz2


### v0.5.1 - *2011-07-01*

* disables tree sidebar for now, since it had unwanted side effects


### v0.5 - *2011-07-01*

* adds tree sidebar
* some refactorings


### v0.4 - *2011-06-27*

* adds better fallback, in case JavaScript is disabled
* rewrites js, fixed middle-button click etc. problems
* refactors css
* sorts, adds and moves icons and images
* updates dot.access


### v0.3.2 - *2011-06-24*

* removes lib versions from file names
* adds 'empty' indicator for icons view


### v0.3.1 - *2011-06-24*

* refactores js
* adds `folderClick` and `fileClick` callback hooks
* fixes .emtpy style


### v0.3 - *2011-06-23*

* includes build stuff, files previously found in the base directory are now located in folder `target`
* styles and scripts are now minified
* adds Modernizr 2.0.4 for future use
* updates jQuery to version 1.6.1


### v0.2.3 - *2011-06-17*

* more refactoring in main.js


### v0.2.2 - *2011-06-16*

* refactores a lot, adds some comments
* includes fixes from [NumEricR](http://github.com/NumEricR)
* adds top/bottom message support, only basicly styled


### v0.2.1 - *2011-06-16*

* fixes croped filenames
* fixes missing .png extension in header
* adds some color to the links
* adds changelog


### v0.2 - *2011-06-15*

* adds icon view

