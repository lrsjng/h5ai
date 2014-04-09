<?php

class Thumb {

	private static $FFMPEG_CMD = "ffmpeg -ss 0:01:00 -i [SOURCE] -an -vframes 1 [TARGET]";
	private static $CONVERT_CMD = "convert -strip [SOURCE][0] [TARGET]";
	private static $THUMB_CACHE = "thumbs";

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
		$this->thumbs_path = $this->app->get_cache_abs_path() . "/" . Thumb::$THUMB_CACHE;
		$this->thumbs_href = $this->app->get_cache_abs_href() . Thumb::$THUMB_CACHE;
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

		if (!is_dir($this->thumbs_path)) {
			@mkdir($this->thumbs_path, 0755, true);
		}

		$name = "thumb-" . sha1("$source_abs_path-$width-$height-$mode") . ".jpg";
		$thumb_abs_path = $this->thumbs_path . "/" . $name;
		$thumb_abs_href = $this->thumbs_href . "/" . $name;

		if (!file_exists($thumb_abs_path) || filemtime($source_abs_path) >= filemtime($thumb_abs_path)) {

			$image = new Image();

			$et = false;
			$opts = $this->app->get_options();
			if ($opts["thumbnails"]["exif"] === true && function_exists("exif_thumbnail")) {
				$et = @exif_thumbnail($source_abs_path);
			}
			if($et !== false) {
				file_put_contents($thumb_abs_path, $et);
				$image->set_source($thumb_abs_path);
				$image->normalize_exif_orientation($source_abs_path);
			} else {
				$image->set_source($source_abs_path);
			}

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
			$cmd = str_replace("[SOURCE]", escapeshellarg($source_abs_path), $cmd);
			$cmd = str_replace("[TARGET]", escapeshellarg($capture_abs_path), $cmd);
			`$cmd`;
		}

		return file_exists($capture_abs_path) ? $capture_abs_path : null;
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


	public function rotate($angle) {

		if (is_null($this->source) || ($angle !== 90 && $angle !== 180 && $angle !== 270)) {
			return;
		}

		$this->source = imagerotate($this->source, $angle, 0);
		if ( $angle === 90 || $angle === 270 ) {
			list($this->width, $this->height) = array($this->height, $this->width);
		}
	}


	public function normalize_exif_orientation($exif_source_file = null) {

		if (is_null($this->source) || !function_exists("exif_read_data")) {
			return;
		}

		if ($exif_source_file === null) {
			$exif_source_file = $this->source_file;
		}

		$exif = exif_read_data($exif_source_file);
		switch(@$exif["Orientation"]) {
			case 3:
				$this->rotate(180);
				break;
			case 6:
				$this->rotate(270);
				break;
			case 8:
				$this->rotate(90);
				break;
		}
	}
}

?>