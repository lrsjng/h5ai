# Changelog


## v0.29.0 - *2016-08-12*

* back to cleaner visual experience
* add option to disable sidebar
* add options to filter/search ignore case
* replace PHP `getenv` calls with `$_SERVER` lookups
* add `view.fallbackMode` option to generally serve only fallback mode
* serve fallback mode for text browsers (`curl`, `links`, `lynx`, `w3m`)
* change type `txt-svg` to `img-svg`, no thumbs but preview
* fix a tree indentation glitch
* fix shell command detection on Windows
* fix Piwik anayltics
* fix `.htaccess` auth issues
* fix drag-select on scrollable content
* fix download-all function
* fix audio and video preview loading
* fix thumbnail request issues
* add `rust` type and icon
* add `autoplay` option to audio and video preview
* add `--dereference` to `shell-du` to follow sym links
* remove *Install* section from `README.md`, causes too much trouble
* remove peer5 support
* update build process to use `node 6.0+`, no need for babel now
* replace `jquery-qrcode` with [`kjua`](https://larsjung.de/kjua/)
* replace `prism` with [`lolight`](https://larsjung.de/lolight/)
* move deps to `package.json` (`normalize.css`, `kjua`, `lolight` and `marked`)
* remove `jQuery`
* remove `lodash`
* remove [`modulejs`](https://larsjung.de/modulejs/) for now
* reduce JS code by 60% (~250kb -> ~100kb)
* update languages (`et`, `nl`, `pl`)


## v0.28.0 - *2015-12-19*

* now require PHP 5.5.0+
* change index path to `/_h5ai/public/index.php`
* now only `/_h5ai/public/` needs to be web-accessible
* add support for custom script and style additions
* add options to set font families
* add search
* add ignorecase sorting option to tree
* add wide links in tree view
* add IE edge mode
* add frontend tests
* fix some styles in IE10
* fix preview bottom bar for small screen widths
* lots of code cleanup and refactorings
* change API
* update build process, now uses [`ghu`](https://larsjung.de/ghu/)
* switch from jshint and jscs to [`eslint`](http://eslint.org/)
* update `jQuery` to 2.1.4
* update `lodash` to 3.9.3 (add debounce and trim)
* update `marked` to 0.3.5
* update `modulejs` to 1.13.0
* update `prism` to 2015-12-19
* update h5bp styles to 5.2.0
* update `normalize.css` to 3.0.3
* remove `Moment.js`


## v0.27.0 - *2015-04-06*

* new layout
* add editorconfig
* drop support for IE9 (gets fallback)
* update sidebar settings
* add info sidebar
* add opt-out for click'n'drag selection
* add package name option for single selections
* add initial support for Peer5
* add option to down-sample images for preview
* add option for natural sorting in tree sidebar
* fix problems with files/folders named `0`
* change font from `Ubuntu` to `Roboto` (smaller footprint, clearer for small sizes)
* switch back to Google Fonts
* improve PDF thumbnail quality
* improve drag-select
* improve image preview
* prevent listing `_h5ai` folder and subfolders
* update build process, now uses [`mkr`](https://larsjung.de/mkr/) and [`fQuery`](https://larsjung.de/fquery/)
* update `jQuery` to 2.1.3
* update `jQuery.qrcode` to 0.11.0
* update `Lo-Dash` to 3.6.0
* update `Modernizr` to 2.8.3
* update `modulejs` to 1.4.0
* update `Moment.js` to 2.9.0
* update `Prism` to 2015-04-05
* remove deprecated Google Analytics code
* remove `jQuery.fracs`
* remove `jQuery.scrollpanel`
* remove `jQuery.mousewheel`
* update languages (`af`, `es`, `ja`, `ko`, `ru`, `zh-cn`)


## v0.26.1 - *2014-08-17*

* fix links


## v0.26.0 - *2014-08-16*

* remove True Type fonts
* outsource themes to [h5ai-themes](https://github.com/lrsjng/h5ai-themes)
* add filesize fallback for large files and 32bit PHP
* fix server detection
* add config file tests to info page
* remove JSON shim
* add caching of command checks
* update `jQuery.mousewheel` to 3.1.12
* update `jQuery.qrcode` to 0.8.0
* replace `markdown` with [`marked`](https://github.com/chjj/marked) 0.3.2
* update `modulejs` to 0.4.5
* update `Moment.js` to 2.8.1
* replace `underscore` with [`Lo-Dash`](https://github.com/lodash/lodash) 2.4.1
* replace `SyntaxHighlighter` with [`Prism`](http://prismjs.com) 2014-08-04


## v0.25.2 - *2014-07-01*

* add optional info page protection
* fix `short_open_tag` issues for PHP < 5.4.0
* fix default folder download (`alwaysVisible` option)
* minor fixes


## v0.25.1 - *2014-06-25*

* fix broken paths for filenames containing '+' characters
* fix Google Universal Analytics
* fix file type check


## v0.25.0 - *2014-06-22*

* add sidebar
* add initial theme support
* add icons from [Evolvere Icon Theme](http://franksouza183.deviantart.com/art/Evolvere-Icon-theme-440718295)
* add PHP variant to calc folder sizes
* add scroll position reset on location change (issue [#279](https://github.com/lrsjng/h5ai/issues/279))
* add option to hide unreadable files
* add option where to place folders (top, inplace, bottom)
* add markdown support for custom header and footer files
* add video and audio preview via HTML5 elements (no fallback, works best in Chrome)
* add filter reset on location change
* add option to make download button always visible
* add Google UA support
* extend selectable icon sizes (add 128px, 192px, 256px, 384px)
* improve preview GUI
* disable thumbs in `cache` folder
* fix QR code URI origin (issue [#287](https://github.com/lrsjng/h5ai/issues/287))
* replace PHP backtick operator with `exec`
* remove server side file manipulation extensions `dropbox`, `delete` and `rename`
* update `H5BP` to 4.3.0
* update `jQuery` to 2.1.1
* update `json2.js` to 2014-02-04
* update `markdown-js` to 0.5.0
* update `Modernizr` to 2.8.2
* update `Moment.js` to 2.6.0
* update `Underscore.js` to 1.6.0
* update languages (`bg`, `ko`, `pt`, `sl`, `sv`, `zh-cn`)


## v0.24.1 - *2014-04-09*

* security fixes! (issues [#268](https://github.com/lrsjng/h5ai/issues/268), [#269](https://github.com/lrsjng/h5ai/issues/269))
* fix WinOS command detection
* update languages (`fi`, `fr`, `hi`, `it`, `zh-tw`)


## v0.24.0 - *2013-09-04*

* updates image and text preview
* adds variable icon sizes
* adds optional natural sort of items
* adds optional checkboxes to select items
* adds text preview modes: none, fixed, markdown
* optionally hide folders in main view
* makes use of EXIF thumbnails optional
* fixes file deletion of multiple files
* fixes `setParentFolderLabels = false`
* fixes shell-arg and RegExp escape issues
* cleans code
* updates info page `/_h5ai`
* adds `aiff` to `audio` types
* adds `da` translation by Ronnie Milbo
* updates to `pl` translation by Mark


## v0.23.0 - *2013-07-21*

* removes `aai` mode!
* drops support for IE7+8 (simple fallback, same as no javascript)
* uses History API if available (way faster browsing)
* faster thumbnail generation if EXIF thumbnails available
* adds optional custom headers/footers that are propageted to all subfolders
* optional hide parent folder links
* some fixes on previews
* speeds up packaged downloads
* add line wrap and line highlighting (on hover) to text preview
* new design (colors, images)
* now uses scalable images for the interface
* fixes filter (ignore parent folder, display of `no match`)
* lots of small fixes
* updates `H5BP` to 4.2.0
* updates `jQuery` to 2.0.3
* updates `jQuery.mousewheel` to 3.1.3
* updates `Moment.js` to 2.1.0
* updates `markdown-js` to 0.4.0-9c21acdf08
* updates `json2.js` to 2013-05-26
* adds `uk` translation by Viktor Matveenko
* updates to `pl` translation by Mark


## v0.22.1 - *2012-10-16*

* bug fix concerning API requests in PHP mode
* minor changes in responsive styles


## v0.22 - *2012-10-14*

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


## v0.21 - *2012-08-06*

* fixes misaligned image previews
* adds no JavaScript fallback to PHP version
* fixes duplicate tree entries and empty main views
* adds Google Analytics support (async)
* improves filter (now ignorecase, now only checks if chars in right order)
* adds keyboard support to image preview (space, enter, backspace, left, right, up, down, f, esc)
* adds text file preview and highlighting with [SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/) (same keys as img preview)
* adds Markdown preview with [markdown-js](https://github.com/evilstreak/markdown-js)
* adds new type `markdown`
* changes language code `gr` to `el`
* adds localization for filter placeholder
* adds `hu` translation by [Rodolffo](https://github.com/Rodolffo)
* updates to [jQuery.qrcode](https://larsjung.de/qrcode/) 0.2
* updates to [jQuery.scrollpanel](https://larsjung.de/scrollpanel/) 0.1
* updates to [modulejs](https://larsjung.de/modulejs/) 0.2
* updates to [Moment.js](http://momentjs.com) 1.7.0
* updates to [Underscore.js](http://underscorejs.org) 1.3.3


## v0.20 - *2012-05-11*

* adds image preview
* adds thumbnails for video and pdf
* adds support for lighttpd, nginx and cherokee and maybe other webservers with PHP
* adds folder size in PHP version via shell `du`
* fixes some localization problems
* updates info page at `/_h5ai/`
* switches to JSHint


## v0.19 - *2012-04-19*

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
* fixes mousewheel problems, updates [jQuery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel) to 3.0.6
* updates `lv` translation
* adds `ro` translation by [Jakob Cosoroabă](https://github.com/midday)
* adds `ja` translation by [metasta](https://github.com/metasta)
* adds `nb` translation by [Sindre Sorhus](https://github.com/sindresorhus)
* adds `sr` translation by [vBm](https://github.com/vBm)
* adds `gr` translation by [xhmikosr](https://github.com/xhmikosr)


## v0.18 - *2012-02-24*

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
* adds `zh-tw` translation by [Yao Wei](https://github.com/medicalwei)
* updates `zh-cn` translation


## v0.17 - *2011-11-28*

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


## v0.16 - *2011-11-02*

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


## v0.15.2 - *2011-09-18*

* adds `it` translation by [Salvo Gentile](https://github.com/SalvoGentile) and [Marco Patriarca](https://github.com/Fexys)
* switches build process from scripp to wepp


## v0.15.1 - *2011-09-06*

* fixes security issues with the zipped download feature
* makes zipped download optional (but enabled by default)


## v0.15 - *2011-09-04*

* adds zipped download for selected files
* cleans and refactores


## v0.14.1 - *2011-09-01*

* display meta information in bottom bar (icon view)
* adds `zh-cn` translation by [Dongsheng Cai](https://github.com/dongsheng)
* adds `pl` translation by Radosław Zając
* adds `ru` translation by Богдан Илюхин


## v0.14 - *2011-08-16*

* adds image thumbnails for PHP version
* new option `slideTree` to turn off auto slide in


## v0.13.2 - *2011-08-12*

* changes in `/h5ai/.htaccess` ... PHP configuration ...


## v0.13.1 - *2011-08-12*

* fixes initial tree display
* adds sort order option
* adds/fixes some translations
* adds `lv` translation by Sandis Veinbergs


## v0.13 - *2011-08-06*

* adds PHP implementation! (should work with PHP 5.2+)
* adds new options
* changes layout of the bottom bar to display status information
* adds language selector to the bottom bar
* quotes keys in `options.js` to make it valid json
* changes value of option `lang` from `undefined` to `null`
* adds some new keys to `h5aiLangs`
* adds browser caching rules for css and js
* adds `pt` translation by [Jonnathan](https://github.com/jonnsl)
* adds `bg` translation by George Andonov


## v0.12.3 - *2011-07-30*

* adds `tr` translation by [Batuhan Icoz](https://github.com/batuhanicoz)


## v0.12.2 - *2011-07-30*

* adds `es` translation by Jose David Calderon Serrano


## v0.12.1 - *2011-07-29*

* fixes unchecked use of console.log


## v0.12 - *2011-07-28*

* improves performance


## v0.11 - *2011-07-27*

* changes license to MIT license, see `LICENSE.txt`


## v0.10.2 - *2011-07-26*

* improves tree scrollbar


## v0.10.1 - *2011-07-24*

* fixes problems with ' in links


## v0.10 - *2011-07-24*

* fixes problems with XAMPP on Windows (see `dot.htaccess` comments for instructions)
* fixes tree fade-in-fade-out effect for small displays ([issue #6](https://github.com/lrsjng/h5ai/issues/6))
* adds custom scrollbar to tree ([issue #6](https://github.com/lrsjng/h5ai/issues/6))
* fixes broken links caused by URI encoding/decoding ([issue #9](https://github.com/lrsjng/h5ai/issues/9))
* adds "empty" to localization (hope Google Translate did a good job here)


## v0.9 - *2011-07-18*

* links hover states between crumb, extended view and tree
* fixes size of tree view (now there's a ugly scrollbar, hopefully will be fixed)
* refactores js to improve performance and cleaned code
* adds caching for folder status codes and content
* adds `fr` translation by [Nicolas](https://github.com/Nicosmos)
* adds `nl` translation by [Stefan de Konink](https://github.com/skinkie)
* adds `sv` translation by Oscar Carlsson


## v0.8 - *2011-07-08*

* removes slashes from folder labels
* optionally rename parent folder entries to real folder names, see `options.js`
* long breadcrumbs (multiple rows) no longer hide content
* error folder icons are opaque now
* refactores js a lot (again...)


## v0.7 - *2011-07-07*

* removes shadows
* smarter tree side bar


## v0.6 - *2011-07-05*

* refactores js
* adds localization, see `options.js`


## v0.5.3 - *2011-07-04*

* refactores js
* adds basic options support via `options.js`
* adds comments to `options.js`
* adds optional tree sidebar


## v0.5.2 - *2011-07-02*

* details view adjusts to window width
* links icon for *.gz and *.bz2


## v0.5.1 - *2011-07-01*

* disables tree sidebar for now, since it had unwanted side effects


## v0.5 - *2011-07-01*

* adds tree sidebar
* some refactorings


## v0.4 - *2011-06-27*

* adds better fallback, in case JavaScript is disabled
* rewrites js, fixed middle-button click etc. problems
* refactors css
* sorts, adds and moves icons and images
* updates dot.access


## v0.3.2 - *2011-06-24*

* removes lib versions from file names
* adds 'empty' indicator for icons view


## v0.3.1 - *2011-06-24*

* refactores js
* adds `folderClick` and `fileClick` callback hooks
* fixes .emtpy style


## v0.3 - *2011-06-23*

* includes build stuff, files previously found in the base directory are now located in folder `target`
* styles and scripts are now minified
* adds Modernizr 2.0.4 for future use
* updates jQuery to version 1.6.1


## v0.2.3 - *2011-06-17*

* more refactoring in main.js


## v0.2.2 - *2011-06-16*

* refactores a lot, adds some comments
* includes fixes from [NumEricR](https://github.com/NumEricR)
* adds top/bottom message support, only basicly styled


## v0.2.1 - *2011-06-16*

* fixes croped filenames
* fixes missing .png extension in header
* adds some color to the links
* adds changelog


## v0.2 - *2011-06-15*

* adds icon view
