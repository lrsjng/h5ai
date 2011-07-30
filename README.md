# h5ai

* [Download, docs and demo](http://larsjung.de/h5ai)
* [Sources at GitHub](http://github.com/lrsjng/h5ai)

h5ai is provided under the terms of the [MIT License](http://github.com/lrsjng/h5ai/blob/master/LICENSE.txt).  
It uses the [Faenza icon set](http://tiheum.deviantart.com/art/Faenza-Icons-173323228) (GPL license).


## Changelog

### v0.12.2
*2011-07-30*

* added es translation by Jose David Calderon Serrano


### v0.12.1
*2011-07-29*

* fixed unchecked use of console.log


### v0.12
*2011-07-28*

* improved performance


### v0.11
*2011-07-27*

* changed license to MIT license, see `LICENSE.txt`


### v0.10.2
*2011-07-26*

* improved tree scrollbar


### v0.10.1
*2011-07-24*

* fixed problems with ' in links


### v0.10
*2011-07-24*

* fixed problems with XAMPP on Windows (see `dot.htaccess` comments for instructions)
* fixed tree fade-in-fade-out effect for small displays ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* added custom scrollbar to tree ([issue #6](http://github.com/lrsjng/h5ai/issues/6))
* fixed broken links caused by URI encoding/decoding ([issue #9](http://github.com/lrsjng/h5ai/issues/9))
* added "empty" to localization (hope Google Translate did a good job here)


### v0.9
*2011-07-18*

* linked hover states between crumb, extended view and tree
* fixed size of tree view (now there's a ugly scrollbar, hopefully will be fixed)
* refactored js to improve performance and cleaned code
* added caching for folder status codes and content
* added fr translation by [Nicolas](http://github.com/Nicosmos)
* added nl translation by [Stefan de Konink](http://github.com/skinkie)
* added sv translation by Oscar Carlsson


### v0.8
*2011-07-08*

* removed slashes from folder labels
* optionally rename parent folder entries to real folder names, see `options.js`
* long breadcrumbs (multiple rows) no longer hide content 
* error folder icons are opaque now
* refactored js a lot (again...)


### v0.7
*2011-07-07*

* removed shadows
* smarter tree side bar


### v0.6
*2011-07-05*

* refactored js
* added localization, see `options.js`


### v0.5.3
*2011-07-04*

* refactored js
* added basic options support via `options.js`
* commented `options.js`
* optional tree sidebar


### v0.5.2
*2011-07-02*

* details view adjusts to window width
* linked icon for *.gz and *.bz2


### v0.5.1
*2011-07-01*

* disabled tree sidebar for now, since it had unwanted side effects


### v0.5
*2011-07-01*

* added tree sidebar
* some refactorings


### v0.4
*2011-06-27*

* added better fallback, in case JavaScript is disabled
* rewrote js, fixed middle-button click etc. problems
* refactored css
* sorted, added and moved icons and images
* updated dot.access


### v0.3.2
*2011-06-24*

* removed lib versions from file names
* added 'empty' indicator for icons view


### v0.3.1
*2011-06-24*

* refactored js
* added `folderClick` and `fileClick` callback hooks
* fixed .emtpy style


### v0.3
*2011-06-23*

* included build stuff, files previously found in the base directory are now located in folder `target`
* styles and scripts are now minified
* added Modernizr 2.0.4 for future use
* updated jQuery to version 1.6.1


### v0.2.3
*2011-06-17*

* more refactoring in main.js
* ~~added custom js support, and global includes~~ *removed, only custom top and bottom sections supported*


### v0.2.2
*2011-06-16*

* refactored a lot, added some comments
* included fixes from [NumEricR](http://github.com/NumEricR/h5ai)
* added top/bottom message support, only basicly styled


### v0.2.1
*2011-06-16*

* fixed croped filenames
* fixed missing .png extension in header
* added some color to the links
* added changelog


### v0.2
*2011-06-15*

* added icon view

