<?php

require_once "image.php";

class Thumbnail {
	
	private $src, $width, $height, $name, $href, $path;

	public static function isUsable() {

		return Image::isUsable();
	}

	public function __construct( $src, $mode, $width, $height ) {
	
		$this->src = $src;
		$this->width = $width;
		$this->height = $height;
		$this->mode = $mode;
		$this->name = sha1( "$this->src-$this->width-$this->height-$this->mode" );
		$this->href = "/h5ai/cache/thumb-" . $this->name . ".jpg";
		$this->path = getenv( "DOCUMENT_ROOT" ) . $this->href;
		$this->liveHref = "/h5ai/php/thumb.php?src=" . $this->src . "&width=" . $this->width . "&height=" . $this->height . "&mode=" . $this->mode;
	}

	public function create( $force = 0 ) {
	
		if (
			$force === 2
			|| ( $force === 1 && !file_exists( $this->path ) )
			|| ( file_exists( $this->path ) && filemtime( $this->src ) >= filemtime( $this->path ) )
		) {
			$image = new Image();
			$image->setSource( $this->src );
			$image->thumb( $this->mode, $this->width, $this->height );
			$image->saveDest( $this->path );	
		}
	}

	public function getHref() {
		
		return $this->href;
	}

	public function getPath() {
		
		return $this->path;
	}

	public function getLiveHref() {
		
		return $this->liveHref;
	}
}

?>