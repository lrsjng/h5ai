<?php

require_once "h5ai.php";

function getHttpCodes( $h5ai, $hrefs ) {

	$codes = array();
	foreach ( $hrefs as $href ) {
		$href = trim( $href );
		if ( strlen( $href ) > 0 ) {
			$codes[$href] = $h5ai->getHttpCode( $href );
		}
	}
	return $codes;
}

$h5ai = new H5ai();
$hrefs = preg_split( "/;/", array_key_exists( "hrefs", $_REQUEST ) ? $_REQUEST[ "hrefs" ] : "" );
$codes = getHttpCodes( $h5ai, $hrefs );

echo count( $codes ) === 0 ? "{}" : json_encode( $codes );

?>