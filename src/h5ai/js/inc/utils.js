
var Utils = function () {

	var pathnameRegEx = /^(\/(.*\/)*)([^\/]+\/?)$/;

	this.splitPathname = function ( pathname ) {
		
		if ( pathname === "/"  ) {
			return [ "", "/" ];
		};
		var match = pathnameRegEx.exec( pathname );
		return [ match[1], match[3] ];
	};

};