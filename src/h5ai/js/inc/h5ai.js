
var H5ai = function ( options, langs, pathCache ) {


	/*******************************
	 * config
	 *******************************/

	var defaults = {
		defaultSortOrder: "C=N;O=A",
		store: {
			viewmode: "h5ai.viewmode"
		},
		customHeader: "h5ai.header.html",
		customFooter: "h5ai.footer.html",
		callbacks: {
			pathClick: []
		},

		viewmodes: [ "details", "icons" ],
		showTree: false,
		folderStatus: {
		},
		lang: undefined,
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

		document.title = decodeURI( document.domain + document.location.pathname );

		this.applyViewmode();
		this.initBreadcrumb();
		this.initTopSpace();
		this.initViews();
		this.customize();
		this.localize( langs, this.config.lang, this.config.useBrowserLang );
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
	 * breadcrumb
	 *******************************/

	this.initBreadcrumb = function () {

		var $ul = $( "body > nav ul" );

		var pathname = "/";
		var path = pathCache.getPathForFolder( pathname );
		$ul.append( path.updateCrumbHtml() );

		var pathnameParts = document.location.pathname.split( "/" );
		for ( idx in pathnameParts ) {
			var part = pathnameParts[idx];
			if ( part !== "" ) {
				pathname += part + "/";
				var path = pathCache.getPathForFolder( pathname );
				$ul.append( path.updateCrumbHtml() );
			};
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
	 * extended view
	 *******************************/

	this.initExtendedView = function () {

		var $ul = $( "<ul/>" );

		// headers
		var $ths = $( "#table th" );
		var $label = $ths.eq( 1 ).find( "a" );
		var $date = $ths.eq( 2 ).find( "a" );
		var $size = $ths.eq( 3 ).find( "a" );
		var $li = $( "<li class='header' />" ).appendTo( $ul );
		$( "<a class='icon'></a>" ).appendTo( $li );
		$( "<a class='label' href='" + $label.attr( "href" ) + "'><span class='l10n-columnName'>" + $label.text() + "</span></a>" ).appendTo( $li );
		$( "<a class='date' href='" + $date.attr( "href" ) + "'><span class='l10n-columnLastModified'>" + $date.text() + "</span></a>" ).appendTo( $li );
		$( "<a class='size' href='" + $size.attr( "href" ) + "'><span class='l10n-columnSize'>" + $size.text() + "</span></a>" ).appendTo( $li );

		// header sort icons
		var order = document.location.search;
		if ( order === "" ) {
			order = this.config.defaultSortOrder;
		};
		var $icon;
		if ( order.indexOf( "O=A" ) >= 0 ) {
			$icon = $( "<img src='/h5ai/images/ascending.png' class='sort' alt='ascending' />" );
		} else {
			$icon = $( "<img src='/h5ai/images/descending.png' class='sort' alt='descending' />" );
		};
		if ( order.indexOf( "C=N" ) >= 0 ) {
			$li.find( "a.label" ).append( $icon );
		} else if ( order.indexOf( "C=M" ) >= 0 ) {
			$li.find( "a.date" ).prepend( $icon );
		} else if ( order.indexOf( "C=S" ) >= 0 ) {
			$li.find( "a.size" ).prepend( $icon );
		};

		$.timer.log( "start entries" );
		// entries
		$( "#table td" ).closest( "tr" ).each( function () {
			var path = pathCache.getPathForTableRow( document.location.pathname, this );
			$ul.append( path.updateExtendedHtml() );
		} );
		$.timer.log( "end  entries" );
		$( "#table" ).remove();

		$( "#extended" ).append( $ul );
		console.log( "folders", $( "#extended .folder" ).size() , "files", $( "#extended .file" ).size() );

		// empty
		if ( $ul.children( ".entry:not(.parentfolder)" ).size() === 0 ) {
			$( "#extended" ).append( $( "<div class='empty l10n-empty'>empty</div>" ) );
		};

		// in case of floats
		$( "#extended" ).addClass( "clearfix" );
	};



	/*******************************
	 * init views
	 *******************************/

	this.initViews = function () {

		this.initExtendedView();

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
	 * customize
	 *******************************/

	this.customize = function () {

		$.ajax( {
			url: this.config.customHeader,
			dataType: "html",
			success: function ( data ) {
				$( "#content > header" ).append( $( data ) ).show();
			}
		} );

		$.ajax( {
			url: this.config.customFooter,
			dataType: "html",
			success: function ( data ) {
				$( "#content > footer" ).prepend( $( data ) ).show();
			}
		} );
	};



	/*******************************
	 * localization
	 *******************************/

	this.localize = function ( data, lang, useBrowserLang ) {

		if ( useBrowserLang === true ) {
			var browserLang = navigator.language;
			if ( data[ browserLang ] !== undefined ) {
				lang = browserLang;
			} else if ( browserLang.length > 2 &&  data[ browserLang.substr( 0, 2 ) ] !== undefined  ) {
				lang = browserLang.substr( 0, 2 );
			};
		};

		if ( lang !== "en" && data[ lang ] !== undefined ) {
			var selected = data[ lang ];
			for ( key in selected ) {
				$( ".l10n-" + key ).text( selected[key] );
			};
		};
	};
};
