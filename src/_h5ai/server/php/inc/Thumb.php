<?php

class Thumb {

	private static $FFMPEG_CMD = "ffmpeg -i \"[SOURCE]\" -an -ss 3 -vframes 1 \"[TARGET]\"";
	private static $CONVERT_CMD = "convert -strip \"[SOURCE][0]\" \"[TARGET]\"";

	public static final function is_supported() {

		if (!function_exists("gd_info")) {
			return false;
		}

		$gdinfo = gd_info();
		return array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
	}


	private $app;


	public function __construct($app) {

		$this->app = $app;
	}


	public function thumb($type, $source_abs_href, $mode, $width, $height) {

		$source_abs_path = $this->app->get_abs_path($source_abs_href);

		if ($type === "img") {
			$capture_abs_path = $source_abs_path;
		} else if ($type === "mov") {
			$capture_abs_path = $this->capture(Thumb::$FFMPEG_CMD, $source_abs_path);
		} else if ($type === "doc") {
			$capture_abs_path = $this->capture(Thumb::$CONVERT_CMD, $source_abs_path);
		}

		return $this->thumb_href($capture_abs_path, $mode, $width, $height);
	}


	private function thumb_href($source_abs_path, $mode, $width, $height) {

		if (!file_exists($source_abs_path)) {
			return null;
		}

		$name = "thumb-" . sha1("$source_abs_path-$width-$height-$mode") . ".jpg";
		$thumb_abs_path = $this->app->get_cache_abs_path() . "/" . $name;
		$thumb_abs_href = $this->app->get_cache_abs_href() . $name;

		if (!file_exists($thumb_abs_path) || filemtime($source_abs_path) >= filemtime($thumb_abs_path)) {
			$image = new Image();
			$image->set_source($source_abs_path);
			$image->thumb($mode, $width, $height);
			$image->save_dest_jpeg($thumb_abs_path, 80);
		}

		return file_exists($thumb_abs_path) ? $thumb_abs_href : null;
	}


	private function capture($cmd, $source_abs_path) {

		if (!file_exists($source_abs_path)) {
			return null;
		}

		$capture_abs_path = $this->app->get_cache_abs_path() . "/capture-" . sha1($source_abs_path) . ".jpg";

		if (!file_exists($capture_abs_path) || filemtime($source_abs_path) >= filemtime($capture_abs_path)) {
			$cmd = str_replace("[SOURCE]", $source_abs_path, $cmd);
			$cmd = str_replace("[TARGET]", $capture_abs_path, $cmd);
			`$cmd`;
		}

		return file_exists($capture_abs_path) ? $capture_abs_path : null;
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

	private $source_file, $source, $width, $height, $type, $dest;


	public static final function is_supported() {

		if (!function_exists("gd_info")) {
			return false;
		}

		$gdinfo = gd_info();
		return array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
	}


	public function __construct($filename = null) {

		$this->source_file = null;
		$this->source = null;
		$this->width = null;
		$this->height = null;
		$this->type = null;

		$this->dest = null;

		$this->set_source($filename);
	}


	public function __destruct() {

		$this->release_source();
		$this->release_dest();
	}


	public function set_source($filename) {

		$this->release_source();
		$this->release_dest();

		if (is_null($filename)) {
			return;
		}

		$this->source_file = $filename;

		list($this->width, $this->height, $this->type) = @getimagesize($this->source_file);

		if (!$this->width || !$this->height) {
			$this->source_file = null;
			$this->width = null;
			$this->height = null;
			$this->type = null;
			return;
		}

		$this->source = imagecreatefromstring(file_get_contents($this->source_file));
	}


	public function save_dest_jpeg($filename, $quality = 80) {

		if (!is_null($this->dest)) {
			@imagejpeg($this->dest, $filename, $quality);
			@chmod($filename, 0775);
		}
	}


	public function save_dest_png($filename, $quality = 9) {

		if (!is_null($this->dest)) {
			@imagepng($this->dest, $filename, $quality);
			@chmod($filename, 0775);
		}
	}


	public function release_dest() {

		if (!is_null($this->dest)) {
			@imagedestroy($this->dest);
			$this->dest = null;
		}
	}


	public function release_source() {

		if (!is_null($this->source)) {
			@imagedestroy($this->source);
			$this->source_file = null;
			$this->source = null;
			$this->width = null;
			$this->height = null;
			$this->type = null;
		}
	}


	private function magic($dest_x, $dest_y, $src_x, $src_y, $dest_width, $dest_height, $src_width, $src_height, $can_width = null, $can_height = null, $color = null) {

		if (is_null($this->source)) {
			return;
		}

		if ($can_width === 0) {
			$can_width = 1;
		}
		if ($can_height === 0) {
			$can_height = 1;
		}
		if ($dest_width === 0) {
			$dest_width = 1;
		}
		if ($dest_height === 0) {
			$dest_height = 1;
		}

		if (!is_null($can_width) && !is_null($can_height)) {
			$this->dest = imagecreatetruecolor($can_width, $can_height);
		} else {
			$this->dest = imagecreatetruecolor($dest_width, $dest_height);
		}

		if (is_null($color)) {
			$color = array(255, 255, 255);
		}
		$icol = imagecolorallocate($this->dest, $color[0], $color[1], $color[2]);
		imagefill($this->dest, 0, 0, $icol);

		imagecopyresampled($this->dest, $this->source, $dest_x, $dest_y, $src_x, $src_y, $dest_width, $dest_height, $src_width, $src_height);
	}


	public function thumb($mode, $width, $height = null, $color = null) {

		if ($height === null) {
			$height = $width;
		}
		if ($mode === "square") {
			$this->square_thumb($width);
		} elseif ($mode === "rational") {
			$this->rational_thumb($width, $height);
		} elseif ($mode === "center") {
			$this->center_thumb($width, $height, $color);
		} else {
			$this->free_thumb($width, $height);
		}
	}


	public function square_thumb($width) {

		if (is_null($this->source)) {
			return;
		}

		$a = min($this->width, $this->height);
		$x = intval(($this->width - $a) / 2);
		$y = intval(($this->height - $a) / 2);

		$this->magic(0, 0, $x, $y, $width, $width, $a, $a);
	}


	public function rational_thumb($width, $height) {

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


	public function center_thumb($width, $height, $color = null) {

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


	public function free_thumb($width, $height) {

		if (is_null($this->source)) {
			return;
		}

		$w = intval($width);
		$h = intval($height);

		$this->magic(0, 0, 0, 0, $w, $h, $this->width, $this->height);
	}
}

?>