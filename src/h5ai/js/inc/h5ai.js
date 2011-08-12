
var H5ai = function ( options, langs ) {


	/*******************************
	 * config
	 *******************************/

	var defaults = {
		store: {
			viewmode: "h5ai.viewmode",
			lang: "h5ai.lang"
		},
		callbacks: {
			pathClick: []
		},

		viewmodes: [ "details", "icons" ],
		sortorder: {
			column: "name",
			ascending: true
		},
		showTree: true,
		folderStatus: {
		},
		lang: null,
		useBrowserLang: true,
		setParentFolderLabels: true,
		linkHoverStates: true
	};
	this.config = $.extend( {}, defaults, options );



	/*******************************
	 * public api
	 *******************************/

	this.pathClick = function ( fn ) {

		if ( $.isFunction( fn ) ) {
			this.config.callbacks.pathClick.push( fn );
		};
		return this;
	};



	/*******************************
	 * init
	 *******************************/

	this.init = function () {

		this.applyViewmode();
		this.initTopSpace();
		this.initViews();
		this.initTree();
		this.linkHoverStates();
		this.initLangSelector( langs );
		this.localize( langs, this.config.lang, this.config.useBrowserLang );
		this.initIndicators();
	};



	/*******************************
	 * callback triggers
	 *******************************/

	this.triggerPathClick = function ( path, context ) {

		for ( idx in this.config.callbacks.pathClick ) {
			this.config.callbacks.pathClick[idx].call( window, path, context );
		};
	};



	/*******************************
	 * local stored viewmode
	 *******************************/

	this.getViewmode = function () {
	
		var viewmode = localStorage.getItem( this.config.store.viewmode );
		return $.inArray( viewmode, this.config.viewmodes ) >= 0 ? viewmode : this.config.viewmodes[0];
	};


	this.applyViewmode = function ( viewmode ) {

		if ( viewmode !== undefined ) {
			localStorage.setItem( this.config.store.viewmode, viewmode );
		};
		viewmode = this.getViewmode();

		$( "#viewdetails,#viewicons" ).hide().removeClass( "current" );

		if ( this.config.viewmodes.length > 1 ) {
			if ( $.inArray( "details", this.config.viewmodes ) >= 0 ) {
				$( "#viewdetails" ).show();
			};
			if ( $.inArray( "icons", this.config.viewmodes ) >= 0 ) {
				$( "#viewicons" ).show();
			};
		};

		if ( viewmode === "details" ) {
			$( "#viewdetails" ).closest( "li" ).addClass( "current" );
			$( "#extended" ).addClass( "details-view" ).removeClass( "icons-view" ).show();
		} else if ( viewmode === "icons" ) {
			$( "#viewicons" ).closest( "li" ).addClass( "current" );
			$( "#extended" ).removeClass( "details-view" ).addClass( "icons-view" ).show();
		} else {
			$( "#extended" ).hide();
		};
	};



	/*******************************
	 * top space, depending on nav height
	 *******************************/

	this.initTopSpace = function () {

		function adjustTopSpace() {
			
			var winHeight = $( window ).height();
			var navHeight = $( "body > nav" ).outerHeight();
			var footerHeight = $( "body > footer" ).outerHeight();
			var contentSpacing = 50;
			var treeSpacing = 50;

			$( "body" )
				.css( "margin-top", "" + ( navHeight + contentSpacing ) + "px" )
				.css( "margin-bottom", "" + ( footerHeight + contentSpacing ) + "px" );
			
			$( "#tree" )
				.css( "top", "" + ( navHeight + treeSpacing ) + "px" )
				.css( "height", "" + ( winHeight - navHeight - footerHeight - 36 - 2 * treeSpacing ) + "px" );
			try {
				$( "#tree" ).get( 0 ).updateScrollbar();
			} catch ( err ) {};
		};

		$( window ).resize( function () {
			adjustTopSpace();
		} );
		adjustTopSpace();
	};



	/*******************************
	 * init views
	 *******************************/

	this.initViews = function () {

		$( "#table" ).remove();

		$( "#viewdetails" ).closest( "li" )
			.click( $.proxy( function () {
				this.applyViewmode( "details" );
			}, this ) );
		$( "#viewicons" ).closest( "li" )
			.click( $.proxy( function () {
				this.applyViewmode( "icons" );
			}, this ) );
	};



	/*******************************
	 * init tree
	 *******************************/

	this.shiftTree = function ( forceVisible, dontAnimate ) {

		var $tree = $( "#tree" );
		var $extended = $( "#extended" );

		if ( $tree.outerWidth() < $extended.offset().left || forceVisible === true ) {
			if ( dontAnimate === true ) {
				$tree.stop().css( { left: 0 } );															
			} else {
				$tree.stop().animate( { left: 0 } );										
			};
		} else {
			if ( dontAnimate === true ) {
				$tree.stop().css( { left: 18 - $tree.outerWidth() } );					
			} else {
				$tree.stop().animate( { left: 18 - $tree.outerWidth() } );					
			};
		};
	};


	this.initTree = function () {

		$( "#tree" ).hover(
			$.proxy( function () { this.shiftTree( true ); }, this ),
			$.proxy( function () { this.shiftTree(); }, this )
		);
		$( window ).resize( $.proxy( function () { this.shiftTree(); }, this ) );
		this.shiftTree( false, true );
	};



	/*******************************
	 * link hover states
	 *******************************/

	this.linkHoverStates = function () {

		if ( !this.config.linkHoverStates ) {
			return;
		};

		$( "a[href^='/']:not(.linkedHoverStates)" ).each( function () {
			
			var $a = $( this ).addClass( "linkedHoverStates" );
			var href = $a.attr( "href" );
			$a.hover(
					function () {
						$( "a[href='" + href + "']" ).addClass( "hover" );
					},
					function () {
						$( "a[href='" + href + "']" ).removeClass( "hover" );					
					}
			);
		} );
	};



	/*******************************
	 * localization
	 *******************************/

	this.initLangSelector = function ( langs ) {
	
		var sortedLangsKeys = [];
		for ( lang in langs ) {
			sortedLangsKeys.push( lang );
		};
		sortedLangsKeys.sort();

		var THIS = this;
		var $ul = $( "<ul />" );
		for ( idx in sortedLangsKeys ) {
			( function ( lang ) {
				$( "<li class='langOption' />" )
					.addClass( lang )
					.text( lang + " - " + langs[lang]["lang"] )
					.appendTo( $ul )
					.click( function () {
						localStorage.setItem( THIS.config.store.lang, lang );
						THIS.localize( langs, lang, false );
					} );
			} )( sortedLangsKeys[idx] );
		};
		$( "#langSelector .langOptions" )
			.append( $ul );
		$( "#langSelector" ).hover(
			function () {
				var $ele = $( ".langOptions" );
				$ele.css( "top", "-" + $ele.outerHeight() + "px" ).stop( true, true ).fadeIn();
			},
			function () {
				$( ".langOptions" ).stop( true, true ).fadeOut();
			}
		);
	};

	this.localize = function ( langs, lang, useBrowserLang ) {

		if ( useBrowserLang === true ) {
			var browserLang = navigator.language;
			if ( langs[ browserLang ] !== undefined ) {
				lang = browserLang;
			} else if ( browserLang.length > 2 &&  langs[ browserLang.substr( 0, 2 ) ] !== undefined  ) {
				lang = browserLang.substr( 0, 2 );
			};
		};

		if ( langs[ lang ] === undefined ) {
			lang = "en";
		};

		var storedLang = localStorage.getItem( this.config.store.lang );
		if ( langs[ storedLang ] !== undefined ) {
			lang = storedLang;
		};

		var selected = langs[ lang ];
		for ( key in selected ) {
			$( ".l10n-" + key ).text( selected[key] );
		};
		$( ".lang" ).text( lang );
		$( ".langOption" ).removeClass( "current" );
		$( ".langOption." + lang ).addClass( "current" );
	};



	/*******************************
	 * initiate tree indicators
	 *******************************/

	this.initIndicators = function () {

		var THIS = this;
		$( "#tree .entry.folder:not(.initiatedIndicator)" ).each( function () {

			var $entry = $( this ).addClass( "initiatedIndicator" );
			var $indicator = $entry.find( "> .indicator" );
			$indicator.click( function( event ) {
				if ( $indicator.hasClass( "unknown" ) ) { 
					$.get( "/h5ai/php/treecontent.php", { "href": $entry.find( "> a" ).attr( "href" ) }, function ( html ) {
						$content = $( html );
						$indicator.removeClass( "unknown" );
						if ( $content.find( "> li" ).size() === 0 ) {
							$indicator.replaceWith( $( "<span class='blank' />" ) );
						} else {
							$indicator.addClass( "open" );
							$entry.find( "> .content" ).replaceWith( $content );
							$( "#tree" ).get( 0 ).updateScrollbar();
							THIS.initIndicators();
						};
					} );
				} else if ( $indicator.hasClass( "open" ) ) {
					$indicator.removeClass( "open" );
					$( "#tree" ).get( 0 ).updateScrollbar( true );
					$entry.find( "> .content" ).slideUp( function() {
						$( "#tree" ).get( 0 ).updateScrollbar();
					} );
				} else {
					$indicator.addClass( "open" );
					$( "#tree" ).get( 0 ).updateScrollbar( true );
					$entry.find( "> .content" ).slideDown( function() {
						$( "#tree" ).get( 0 ).updateScrollbar();
					} );				
				};
			} );
		} );
	};
};
