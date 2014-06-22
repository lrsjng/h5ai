<?php

class Image {

	private $source_file, $source, $width, $height, $type, $dest;


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
