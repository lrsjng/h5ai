<?php

	require_once "thumbnail.php";

	$src = $_REQUEST["src"];
	$width = $_REQUEST["width"];
	$height = $_REQUEST["height"];
	$mode = $_REQUEST["mode"];
	
	if ( !Thumbnail::isUsable() ) {
		Image::showImage( $src );	
		exit;
	}

	$thumbnail = new Thumbnail( $src, $mode, $width, $height );
	$thumbnail->create( 1 );
	if ( file_exists( $thumbnail->getPath() ) ) {
		Image::showImage( $thumbnail->getPath() );
	} else {
		$image = new Image();
		$image->setSource( $src );
		$image->thumb( $mode, $width, $height );
		$image->showDest();	
	}

?>