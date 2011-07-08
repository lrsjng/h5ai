
var H5ai = function ( options, langs ) {

	var THIS = this;



	/*******************************
	 * config
	 *******************************/

	var defaults = {
		defaultSortOrder: "C=N;O=A",
		store: {
			viewmode: "h5ai.viewmode"
		},
		icons: {
			crumb: "/h5ai/images/crumb.png",
			ascending: "/h5ai/images/ascending.png",
			descending: "/h5ai/images/descending.png"
		},
		customHeader: "h5ai.header.html",
		customFooter: "h5ai.footer.html",
		callbacks: {
			folderClick: [],
			fileClick: []			
		},

		viewmodes: [ "details", "icons" ],
		showTree: false,
		folderStatus: {
		},
		lang: undefined,
		useBrowserLang: true,
		setParentFolderLabels: true
	};
	this.config = $.extend( {}, defaults, options );



	/*******************************
	 * public api
	 *******************************/
	
	this.folderClick = function ( fn ) {

		if ( typeof fn === "function" ) {
			this.config.callbacks.folderClick.push( fn );
		};
		return this;
	};


	this.fileClick = function ( fn ) {

		if ( typeof fn === "function" ) {
			this.config.callbacks.fileClick.push( fn );
		};
		return this;
	};



	/*******************************
	 * init
	 *******************************/

	this.init = function () {

		document.title = document.domain + decodeURI( document.location.pathname );

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

	this.triggerFolderClick = function ( label ) {

		for ( idx in this.config.callbacks.folderClick ) {
			this.config.callbacks.folderClick[idx].call( window, label );
		};
	};


	this.triggerFileClick = function ( label ) {

		for ( idx in this.config.callbacks.fileClick ) {
			this.config.callbacks.fileClick[idx].call( window, label );
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

		$( "body > nav li.view" ).hide().removeClass( "current" );
		
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
			$( "#table" ).hide();
			$( "#extended" ).addClass( "details-view" ).removeClass( "icons-view" ).show();
		} else if ( viewmode === "icons" ) {
			$( "#viewicons" ).closest( "li" ).addClass( "current" );
			$( "#table" ).hide();
			$( "#extended" ).removeClass( "details-view" ).addClass( "icons-view" ).show();
		} else {
			$( "#table" ).show();
			$( "#extended" ).hide();
		};
	};

	

	/*******************************
	 * breadcrumb
	 *******************************/

	this.initBreadcrumb = function () {

		var $domain = $( "#domain" );
		var $ul = $domain.closest( "ul" );

		$domain.find( "span" ).text( document.domain );
		var pathnameParts = decodeURI( document.location.pathname ).split( "/" );
		var pathname = "/";
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
			
			var height = $( "body > nav" ).height();
			var space = height + 50;
			$( "body" ).css( "margin-top", "" + space + "px" );
			$( "#tree" ).css( "top", "" + space + "px" );
		};

		$( window ).resize( function () {
			adjustTopSpace();
		} );
		adjustTopSpace();
	};



	/*******************************
	 * table view
	 *******************************/

	this.initTableView = function () {

		$( "#table td" ).removeAttr( "align" ).removeAttr( "valign" );
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
			$icon = $( "<img src='" + this.config.icons.ascending + "' class='sort' alt='ascending' />" );
		} else {
			$icon = $( "<img src='" + this.config.icons.descending + "' class='sort' alt='descending' />" );
		};
		if ( order.indexOf( "C=N" ) >= 0 ) {
			$li.find( "a.label" ).append( $icon );
		} else if ( order.indexOf( "C=M" ) >= 0 ) {
			$li.find( "a.date" ).prepend( $icon );
		} else if ( order.indexOf( "C=S" ) >= 0 ) {
			$li.find( "a.size" ).prepend( $icon );
		};

		// entries
		$( "#table td" ).closest( "tr" ).each( function () {
			var path = pathCache.getPathForTableRow( decodeURI( document.location.pathname ), this );
			$ul.append( path.updateExtendedHtml() );
		} );

		$( "#extended" ).append( $ul );

		// empty
		if ( $ul.children( ".entry:not(.parentfolder)" ).size() === 0 ) {
			$( "#extended" ).append( $( "<div class='empty'>empty</div>" ) );
		};

		// in case of floats
		$( "#extended" ).addClass( "clearfix" );
	};



	/*******************************
	 * init views
	 *******************************/

	this.initViews = function () {

		this.initTableView();
		this.initExtendedView();

		$( "#viewdetails" ).closest( "li" )
			.click( function () {
				THIS.applyViewmode( "details" );
			} );
		$( "#viewicons" ).closest( "li" )
			.click( function () {
				THIS.applyViewmode( "icons" );
			} );
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
			if ( lang === "en" ) {
				lang = undefined;
			};
		};

		if ( data[ lang ] !== undefined ) {
			var selected = data[ lang ];
			for ( key in selected ) {
				$( ".l10n-" + key ).text( selected[key] );
			};
		};
	};
};
