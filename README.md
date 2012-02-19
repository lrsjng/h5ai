# h5ai

Don't use files from this repository (`src` folder) for installation.
They need to be preprocessed/compiled to work correctly. You'll find a
precompiled package on the [project page](http://larsjung.de/h5ai).

To report a bug or make a feature request
please create [a new issue](http://github.com/lrsjng/h5ai/issues/new).

* Website with download, docs and demo: <http://larsjung.de/h5ai>
* Sources: <http://github.com/lrsjng/h5ai>
* Q&A group: <http://groups.google.com/group/h5ai>

h5ai is provided under the terms of the [MIT License](http://github.com/lrsjng/h5ai/blob/master/LICENSE.txt).


## h5ai profits from these great projects

* [AmplifyJS](http://amplifyjs.com) (MIT/GPL)
* [Datejs](http://www.datejs.com) (MIT)
* [Faenza icon set](http://tiheum.deviantart.com/art/Faenza-Icons-173323228) (GPL)
* [HTML5 ★ Boilerplate](http://html5boilerplate.com)
* [jQuery](http://jquery.com) (MIT/GPL)
* [jQuery.mousewheel](http://github.com/brandonaaron/jquery-mousewheel) (MIT)
* [modernizr](http://www.modernizr.com) (MIT/BSD)
* [qrcode](http://www.d-project.com/qrcode/index.html) (MIT)


## Changelog


### v0.18 - *2012-02-??*

* adds optional QRCode display
* adds optional filtering for displayed files and folders
* improves zipped download
* custom headers/footers are now optional and disabled by default
* fixes problems with folder recognition in the JS version
* fixes include problems in PHP version
* fixes path problems on servers running on Windows in PHP version
* fixes broken links in custom headers/footers while zipped download enabled
* fixes problems with thumbnails for files with single or double quotes in filename
* updates year in `LICENSE.TXT`
* updates es translation


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

* added it translation by [Salvo Gentile](http://github.com/SalvoGentile) and [Marco Patriarca](http://github.com/Fexys)
* switched build process from scripp to wepp


### v0.15.1 - *2011-09-06*

* fixed security issues with the zipped download feature
* made zipped download optional (but enabled by default)


### v0.15 - *2011-09-04*

* added zipped download for selected files
* cleaned and refactored


### v0.14.1 - *2011-09-01*

* display meta information in bottom bar (icon view)
* added zh-cn translation by [Dongsheng Cai](http://github.com/dongsheng)
* added pl translation by Radosław Zając
* added ru translation by Богдан Илюхин


### v0.14 - *2011-08-16*

* added image thumbnails for PHP version
* new option `slideTree` to turn off auto slide in


### v0.13.2 - *2011-08-12*

* changes in `/h5ai/.htaccess` ... PHP configuration ...


### v0.13.1 - *2011-08-12*

* ~~hopefully fixed that PHP doesn't get interpreted~~ :/
* fixed initial tree display
* added sort order option
* added/fixed some translations
* added lv translation by Sandis Veinbergs


### v0.13 - *2011-08-06*

* added PHP implementation! (should work with PHP 5.2+)
* added new options
* changed layout of the bottom bar to display status information
* added language selector to the bottom bar
* quoted keys in `options.js` to make it valid json
* changed value of option `lang` from `undefined` to `null`
* added some new keys to `h5aiLangs`
* added browser caching rules for css and js
* added pt translation by [Jonnathan](http://github.com/jonnsl)
* added bg translation by George Andonov


### v0.12.3 - *2011-07-30*

* added tr translation by [Batuhan Icoz](http://github.com/batuhanicoz)


### v0.12.2 - *2011-07-30*

* added es translation by Jose David Calderon Serrano


### v0.12.1 - *2011-07-29*

* fixed unchecked use of console.log


### v0.12 - *2011-07-28*

* improved performance


### v0.11 - *2011-07-27*

* changed license to MIT license, see `LICENSE.txt`


### v0.10.2 - *2011-07-26*

* improved tree scrollbar


### v0.10.1 - *2011-07-24*

* fixed problems with ' in links


### v0.10 - *2011-07-24*

* fixed problems with XAMPP on Windows (see `dot.htaccess` comments for instructions)
* fixed tree fade-in-fade-out effect for small displays ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* added custom scrollbar to tree ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* fixed broken links caused by URI encoding/decoding ([issue #9](http://github.com/lrsjng/h5ai/issues/9))
* added "empty" to localization (hope Google Translate did a good job here)


### v0.9 - *2011-07-18*

* linked hover states between crumb, extended view and tree
* fixed size of tree view (now there's a ugly scrollbar, hopefully will be fixed)
* refactored js to improve performance and cleaned code
* added caching for folder status codes and content
* added fr translation by [Nicolas](http://github.com/Nicosmos)
* added nl translation by [Stefan de Konink](http://github.com/skinkie)
* added sv translation by Oscar Carlsson


### v0.8 - *2011-07-08*

* removed slashes from folder labels
* optionally rename parent folder entries to real folder names, see `options.js`
* long breadcrumbs (multiple rows) no longer hide content
* error folder icons are opaque now
* refactored js a lot (again...)


### v0.7 - *2011-07-07*

* removed shadows
* smarter tree side bar


### v0.6 - *2011-07-05*

* refactored js
* added localization, see `options.js`


### v0.5.3 - *2011-07-04*

* refactored js
* added basic options support via `options.js`
* commented `options.js`
* optional tree sidebar


### v0.5.2 - *2011-07-02*

* details view adjusts to window width
* linked icon for *.gz and *.bz2


### v0.5.1 - *2011-07-01*

* disabled tree sidebar for now, since it had unwanted side effects


### v0.5 - *2011-07-01*

* added tree sidebar
* some refactorings


### v0.4 - *2011-06-27*

* added better fallback, in case JavaScript is disabled
* rewrote js, fixed middle-button click etc. problems
* refactored css
* sorted, added and moved icons and images
* updated dot.access


### v0.3.2 - *2011-06-24*

* removed lib versions from file names
* added 'empty' indicator for icons view


### v0.3.1 - *2011-06-24*

* refactored js
* added `folderClick` and `fileClick` callback hooks
* fixed .emtpy style


### v0.3 - *2011-06-23*

* included build stuff, files previously found in the base directory are now located in folder `target`
* styles and scripts are now minified
* added Modernizr 2.0.4 for future use
* updated jQuery to version 1.6.1


### v0.2.3 - *2011-06-17*

* more refactoring in main.js
* ~~added custom js support, and global includes~~ *removed, only custom top and bottom sections supported*


### v0.2.2 - *2011-06-16*

* refactored a lot, added some comments
* included fixes from [NumEricR](http://github.com/NumEricR)
* added top/bottom message support, only basicly styled


### v0.2.1 - *2011-06-16*

* fixed croped filenames
* fixed missing .png extension in header
* added some color to the links
* added changelog


### v0.2 - *2011-06-15*

* added icon view

