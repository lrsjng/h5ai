
var H5ai = function ( options ) {

	/*******************************
	 * config
	 *******************************/

	var defaults = {
		columnClasses: [ "icon", "name", "date", "size" ],
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
		useBrowserLang: true
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

		this.applyViewmode();
		this.initBreadcrumb();
		this.initViews();
		this.customize();
		this.localize( h5aiLangs, this.config.lang, this.config.useBrowserLang );
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
		if ( $.inArray( viewmode, this.config.viewmodes ) >= 0 ) {
			return viewmode;
		};
		return this.config.viewmodes[0];
	};


	this.applyViewmode = function ( viewmode ) {

		if ( viewmode !== undefined ) {
			localStorage.setItem( this.config.store.viewmode, viewmode );
		};

		$( "body > nav li.view" ).hide();
		if ( this.config.viewmodes.length > 1 ) {
			if ( $.inArray( "details", this.config.viewmodes ) >= 0 ) {
				$( "#viewdetails" ).show();
			};
			if ( $.inArray( "icons", this.config.viewmodes ) >= 0 ) {
				$( "#viewicons" ).show();
			};
		};

		$( "body > nav li.view" ).removeClass( "current" );
		if ( this.getViewmode() === "details" ) {
			$( "#viewdetails" ).closest( "li" ).addClass( "current" );
			$( "#table" ).hide();
			$( "#extended" ).addClass( "details-view" ).removeClass( "icons-view" ).show();
		} else if ( this.getViewmode() === "icons" ) {
			$( "#viewicons" ).closest( "li" ).addClass( "current" );
			$( "#table" ).hide();
			$( "#extended" ).removeClass( "details-view" ).addClass( "icons-view" ).show();
		} else {
			$( "#table" ).show();
			$( "#extended" ).hide();
		};
	};

	

	/*******************************
	 * breadcrumb and doc title
	 *******************************/

	this.initBreadcrumb = function () {

		$( "#domain span" ).text( document.domain );
		var pathname = decodeURI( document.location.pathname );
		var parts = pathname.split( "/" );
		var path = "/";
		var $ul = $( "nav ul" );
		for ( idx in parts ) {
			var part = parts[idx];
			if ( part !== "" ) {
				path += part + "/";
				$ul.append( $( "<li class='crumb'><a href='" +  path + "'><img src='" + this.config.icons.crumb + "' alt='>' />" + part + "</a></li>" ) );
			};
		};
		$( "body > nav .crumb:last" ).addClass( "current" );

		document.title = document.domain + pathname;
	};



	/*******************************
	 * table view
	 *******************************/

	this.initTableView = function () {

		var ref = this;
		function getColumnClass( idx ) {

			if ( idx >= 0 && idx < ref.config.columnClasses.length ) {
				return ref.config.columnClasses[idx];
			};
			return "unknown";
		};
		
		$( "#table td" ).removeAttr( "align" ).removeAttr( "valign" );
		$( "#table tr" ).each( function () {
			var colIdx = 0;
			$( this ).find( "th,td" ).each( function () {
				$( this ).addClass( getColumnClass( colIdx++ ) );
			} );
		} );
	};



	/*******************************
	 * extended view
	 *******************************/

	this.initExtendedView = function () {

		var $ul = $( "<ul/>" );

		// headers
		var $li = $( "<li class='header' />" ).appendTo( $ul );
		$( "<a class='icon'></a>" ).appendTo( $li );
		var $label = $( "th.name a" );
		var $date = $( "th.date a" );
		var $size = $( "th.size a" );
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
		$( "#table td.name a" ).closest( "tr" ).each( function () {
			var $tr = $( this );
			var $img = $tr.find( "td.icon img" );
			var iconsmall = $img.attr( "src" );
			var iconbig = iconsmall.replace( "16x16", "48x48" );
			var alt = $img.attr( "alt" );
			var $link = $tr.find( "td.name a" );
			var label = $link.text();
			var href = $link.attr( "href" );
			var date = $tr.find( "td.date" ).text();
			var size = $tr.find( "td.size" ).text();

			var $li = $( "<li class='entry' />" ).appendTo( $ul );
			if ( alt === "[DIR]" ) {
				$li.addClass( "folder" );
			} else {
				$li.addClass( "file" );					
			}
			var $a = $( "<a href='" + href + "' />" ).appendTo( $li );
			$( "<span class='icon small'><img src='" + iconsmall + "' alt='" + alt + "' /></span>" ).appendTo( $a );
			$( "<span class='icon big'><img src='" + iconbig + "' alt='" + alt + "' /></span>" ).appendTo( $a );
			$( "<span class='label'>" + label + "</span>" ).appendTo( $a );
			$( "<span class='date'>" + date + "</span>" ).appendTo( $a );
			$( "<span class='size'>" + size + "</span>" ).appendTo( $a );
		} );

		$( "#extended" ).append( $ul );

		$entries = $( "#extended .entry" );

		// empty
		if ( $entries.size() === 0 || $entries.size() === 1 && $entries.find( ".label" ).text() === "Parent Directory" ) {
			$( "#extended" ).append( $( "<div class='empty'>empty</div>" ) );
		};

		// parent folder
		if ( $entries.size() > 0 ) {
			$entry0 = $( $entries.get(0) );
			if ( $entry0.find( ".label" ).text() === "Parent Directory" ) {
				$entry0.find( ".label" ).addClass( "l10n-parentDirectory" );
				$entry0.addClass( "parentfolder" );
			};
		};

		// in case of floats
		$( "#extended" ).append( $( "<div class='clearfix' />" ) );

		// click callbacks
		var ref = this;
		$( "#extended .entry.folder" )
			.click( function() {
				ref.triggerFolderClick( $( this ).find( ".label" ).text() );
			} );
		$( "#extended .entry.file" )
			.click( function() {
				ref.triggerFileClick( $( this ).find( ".label" ).text() );
			} );
	};


	/*******************************
	 * init views
	 *******************************/

	this.initViews = function () {

		this.initTableView();
		this.initExtendedView();

		var ref = this;
		$( "#viewdetails" ).closest( "li" )
			.click( function () {
				ref.applyViewmode( "details" );
			} );
		$( "#viewicons" ).closest( "li" )
			.click( function () {
				ref.applyViewmode( "icons" );
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
