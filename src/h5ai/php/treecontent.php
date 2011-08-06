<?php

if ( ! array_key_exists( "href", $_REQUEST ) ) {
	exit;
}
 
require_once "h5ai.php";
require_once "tree.php";

$h5ai = new H5ai();

$absHref = trim( $_REQUEST[ "href" ] );
$absPath = $h5ai->getAbsPath( $absHref );

$tree = new TreeEntry( $h5ai, $absPath, $absHref );
$tree->loadContent();

echo $tree->contentToHtml();

?>