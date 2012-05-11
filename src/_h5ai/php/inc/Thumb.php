<?php

class Thumb {

	private static $FFMPEG = "ffmpeg -i \"[SOURCE]\" -an -ss 3 -vframes 1 \"[TARGET]\"";
	private static $CONVERT = "convert -strip \"[SOURCE][0]\" \"[TARGET]\"";

	public static final function is_supported() {

		if (!function_exists("gd_info")) {
			return false;
		}

		$gdinfo = gd_info();
		return array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
	}


	private $h5ai;


	public function __construct($h5ai) {

		$this->h5ai = $h5ai;
	}


	public function thumb($type, $sourceAbsHref, $mode, $width, $height) {

		$sourceAbsPath = $this->h5ai->getAbsPath($sourceAbsHref);

		if ($type === "img") {
			$captureAbsPath = $sourceAbsPath;
		} else if ($type === "mov") {
			$captureAbsPath = $this->capture(Thumb::$FFMPEG, $sourceAbsPath);
		} else if ($type === "doc") {
			$captureAbsPath = $this->capture(Thumb::$CONVERT, $sourceAbsPath);
		}

		return $this->thumb_href($captureAbsPath, $mode, $width, $height);
	}


	private function thumb_href($sourceAbsPath, $mode, $width, $height) {

		if (!file_exists($sourceAbsPath)) {
			return null;
		}

		$name = "cache/thumb-" . sha1("$sourceAbsPath-$width-$height-$mode") . ".jpg";
		// $name = "cache/thumb-" . sha1("$sourceAbsPath-$width-$height-$mode") . ".png";
		$thumbAbsHref = $this->h5ai->getH5aiAbsHref() . $name;
		$thumbAbsPath = $this->h5ai->getH5aiAbsPath() . "/" . $name;

		if (!file_exists($thumbAbsPath) || filemtime($sourceAbsPath) >= filemtime($thumbAbsPath)) {
			$image = new Image();
			$image->setSource($sourceAbsPath);
			$image->thumb($mode, $width, $height);
			$image->saveDestJpeg($thumbAbsPath, 80);

			// $image->saveDestPng($thumbAbsPath, 9);
			// Magic::thumb($mode, $sourceAbsPath, $thumbAbsPath, $width, $height);
		}

		return file_exists($thumbAbsPath) ? $thumbAbsHref : null;
	}


	private function capture($cmd, $sourceAbsPath) {

		if (!file_exists($sourceAbsPath)) {
			return null;
		}

		$captureAbsPath = $this->h5ai->getH5aiAbsPath() . "/cache/capture-" . sha1($sourceAbsPath) . ".jpg";

		if (!file_exists($captureAbsPath) || filemtime($sourceAbsPath) >= filemtime($captureAbsPath)) {
			$cmd = str_replace("[SOURCE]", $sourceAbsPath, $cmd);
			$cmd = str_replace("[TARGET]", $captureAbsPath, $cmd);
			`$cmd`;
		}

		return file_exists($captureAbsPath) ? $captureAbsPath : null;
	}
}



class Magic {

	private static $GET_SIZE_CMD = "identify -format \"%w %h\" \"[SOURCE]\"";
	private static $RESIZE_CMD = "convert -strip -transparent-color \"#ffffff\" -resize [WIDTH]x[HEIGHT] -quality 80 \"[SOURCE]\" \"[TARGET]\"";
	private static $SQUARE_CMD = "convert -strip -transparent-color \"#ffffff\" -crop [CWIDTH]x[CWIDTH]+[CLEFT]+[CTOP] -resize [WIDTH]x[WIDTH] -quality 80 \"[SOURCE]\" \"[TARGET]\"";


	private static final function img_size($source) {

		$cmd = str_replace("[SOURCE]", str_replace("\"", "\\\"", $source), Magic::$GET_SIZE_CMD);
		$size = explode(" ", `$cmd`);
		$size[0] = intval($size[0]);
		$size[1] = intval($size[1]);
		return $size;
	}

	private static final function rational($source, $target, $width, $height) {

		$cmd = str_replace("[SOURCE]", str_replace("\"", "\\\"", $source), Magic::$RESIZE_CMD);
		$cmd = str_replace("[TARGET]", str_replace("\"", "\\\"", $target), $cmd);
		$cmd = str_replace("[WIDTH]", $width, $cmd);
		$cmd = str_replace("[HEIGHT]", $height, $cmd);
		`$cmd`;
	}

	private static final function square($source, $target, $width) {

		$size = Magic::img_size($source);
		$w = $size[0];
		$h = $size[1];

		$cwidth = min($w, $h);
		$cleft = ($w - $cwidth) / 2;
		$ctop = ($h - $cwidth) / 2;

		$cmd = str_replace("[SOURCE]", str_replace("\"", "\\\"", $source), Magic::$SQUARE_CMD);
		$cmd = str_replace("[TARGET]", str_replace("\"", "\\\"", $target), $cmd);
		$cmd = str_replace("[CWIDTH]", $cwidth, $cmd);
		$cmd = str_replace("[CLEFT]", $cleft, $cmd);
		$cmd = str_replace("[CTOP]", $ctop, $cmd);
		$cmd = str_replace("[WIDTH]", $width, $cmd);
		`$cmd`;
	}

	public static final function thumb($mode, $source, $target, $width, $height = null, $color = null) {

		if ($height === null) {
			$height = $width;
		}
		if ($mode === "square") {
			Magic::square($source, $target, $width);
		} elseif ($mode === "rational") {
			Magic::rational($source, $target, $width, $height);
		}
	}
}



class Image {

	private $sourceFile, $source, $width, $height, $type, $dest;


	public static final function is_supported() {

		if (!function_exists("gd_info")) {
			return false;
		}

		$gdinfo = gd_info();
		return array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
	}


	public function __construct($filename = null) {

		$this->sourceFile = null;
		$this->source = null;
		$this->width = null;
		$this->height = null;
		$this->type = null;

		$this->dest = null;

		$this->setSource($filename);
	}


	public function __destruct() {

		$this->releaseSource();
		$this->releaseDest();
	}


	public function setSource($filename) {

		$this->releaseSource();
		$this->releaseDest();

		if (is_null($filename)) {
			return;
		}

		$this->sourceFile = $filename;

		list($this->width, $this->height, $this->type) = @getimagesize($this->sourceFile);

		if (!$this->width || !$this->height) {
			$this->sourceFile = null;
			$this->width = null;
			$this->height = null;
			$this->type = null;
			return;
		}

		$this->source = imagecreatefromstring(file_get_contents($this->sourceFile));
	}


	public function saveDestJpeg($filename, $quality = 80) {

		if (!is_null($this->dest)) {
			@imagejpeg($this->dest, $filename, $quality);
			@chmod($filename, 0775);
		}
	}


	public function saveDestPng($filename, $quality = 9) {

		if (!is_null($this->dest)) {
			@imagepng($this->dest, $filename, $quality);
			@chmod($filename, 0775);
		}
	}


	public function releaseDest() {

		if (!is_null($this->dest)) {
			@imagedestroy($this->dest);
			$this->dest = null;
		}
	}


	public function releaseSource() {

		if (!is_null($this->source)) {
			@imagedestroy($this->source);
			$this->sourceFile = null;
			$this->source = null;
			$this->width = null;
			$this->height = null;
			$this->type = null;
		}
	}


	private function magic($destX, $destY, $srcX, $srcY, $destWidth, $destHeight, $srcWidth, $srcHeight, $canWidth = null, $canHeight = null, $color = null) {

		if (is_null($this->source)) {
			return;
		}

		if ($canWidth === 0) {
			$canWidth = 1;
		}
		if ($canHeight === 0) {
			$canHeight = 1;
		}
		if ($destWidth === 0) {
			$destWidth = 1;
		}
		if ($destHeight === 0) {
			$destHeight = 1;
		}

		if (!is_null($canWidth) && !is_null($canHeight)) {
			$this->dest = imagecreatetruecolor($canWidth, $canHeight);
		} else {
			$this->dest = imagecreatetruecolor($destWidth, $destHeight);
		}

		if (is_null($color)) {
			$color = array(255, 255, 255);
		}
		$icol = imagecolorallocate($this->dest, $color[0], $color[1], $color[2]);
		imagefill($this->dest, 0, 0, $icol);

		imagecopyresampled($this->dest, $this->source, $destX, $destY, $srcX, $srcY, $destWidth, $destHeight, $srcWidth, $srcHeight);
	}


	public function thumb($mode, $width, $height = null, $color = null) {

		if ($height === null) {
			$height = $width;
		}
		if ($mode === "square") {
			$this->squareThumb($width);
		} elseif ($mode === "rational") {
			$this->rationalThumb($width, $height);
		} elseif ($mode === "center") {
			$this->centerThumb($width, $height, $color);
		} else {
			$this->freeThumb($width, $height);
		}
	}


	public function squareThumb($width) {

		if (is_null($this->source)) {
			return;
		}

		$a = min($this->width, $this->height);
		$x = intval(($this->width - $a) / 2);
		$y = intval(($this->height - $a) / 2);

		$this->magic(0, 0, $x, $y, $width, $width, $a, $a);
	}


	public function rationalThumb($width, $height) {

		if (is_null($this->source)) {
			return;
		}

		$r = 1.0 * $this->width / $this->height;

		$h = $height;
		$w = $r * $h;

		if ($w > $width) {

			$w = $width;
			$h = 1.0 / $r * $w;
		}

		$w = intval($w);
		$h = intval($h);

		$this->magic(0, 0, 0, 0, $w, $h, $this->width, $this->height);
	}


	public function centerThumb($width, $height, $color = null) {

		if (is_null($this->source)) {
			return;
		}

		$r = 1.0 * $this->width / $this->height;

		$h = $height;
		$w = $r * $h;

		if ($w > $width) {

			$w = $width;
			$h = 1.0 / $r * $w;
		}

		$w = intval($w);
		$h = intval($h);

		$x = intval(($width - $w) / 2);
		$y = intval(($height - $h) / 2);

		$this->magic($x, $y, 0, 0, $w, $h, $this->width, $this->height, $width, $height, $color);
	}


	public function freeThumb($width, $height) {

		if (is_null($this->source)) {
			return;
		}

		$w = intval($width);
		$h = intval($height);

		$this->magic(0, 0, 0, 0, $w, $h, $this->width, $this->height);
	}
}

?>