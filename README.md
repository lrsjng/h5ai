# h5ai v0.9 &#160; · &#160; a beautified Apache index


## Screenshots

<a href="http://larsjung.de/h5ai/sample/screenshots/h5ai-v0.7-details.png" target="_blank">
	<img src="http://larsjung.de/h5ai/sample/screenshots/h5ai-v0.7-details.png" width="400px" alt="screenshot" title="details view" style="display: inline" />
</a>
&#160; &#160; &#160;
<a href="http://larsjung.de/h5ai/sample/screenshots/h5ai-v0.7-icons.png" target="_blank">
	<img src="http://larsjung.de/h5ai/sample/screenshots/h5ai-v0.7-icons.png" width="400px" alt="screenshot" title="icons view" style="display: inline" />
</a>


## Live example

View a [sample folder](http://larsjung.de/h5ai/sample)  
*(the files are all empty to save webspace)*


## Install

Everything you need is located in folder `target`.

* Copy folder `h5ai` to the web-root directory of your server or alternativly set an alias `/h5ai/` to
  this folder.
* Add the content of file `dot.htaccess` to the `.htaccess` file inside the directory you want to be
  styled (you might have to create this file). This directory and any subdirectories will be styled by h5ai.
* Adjust `options.js` inside the `h5ai` folder to your needs. Defaults will be fine for a start.

Optionally add `h5ai.header.html` and/or `h5ai.footer.html` files to any of the styled folders to [display
custom top or bottom sections](http://larsjung.de/h5ai/sample/customize). The content of those files
will be wrapped by `<header>` and `<footer>` tags.


## License and References

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a>  
[h5ai](http://larsjung.de/h5ai) is provided under the terms of the [CC BY-SA 3.0 License](http://creativecommons.org/licenses/by-sa/3.0/).  
It is based on
[HTML5 Boilerplate](http://html5boilerplate.com),
[jQuery](http://jquery.com),
[Modernizr](http://www.modernizr.com) and
[Faenza icon set](http://tiheum.deviantart.com/art/Faenza-Icons-173323228),
please respect their rights.


## Changelog

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

