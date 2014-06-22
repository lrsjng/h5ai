<?php

class Thumb {

	private static $FFMPEG_CMDV = array("ffmpeg", "-ss", "0:01:00", "-i", "[SRC]", "-an", "-vframes", "1", "[DEST]");
	private static $AVCONV_CMDV = array("avconv", "-ss", "0:01:00", "-i", "[SRC]", "-an", "-vframes", "1", "[DEST]");
	private static $CONVERT_CMDV = array("convert", "-strip", "[SRC][0]", "[DEST]");
	private static $THUMB_CACHE = "thumbs";


	private $app, $thumbs_path, $thumbs_href;


	public function __construct($app) {

		$this->app = $app;
		$this->thumbs_path = CACHE_PATH . "/" . Thumb::$THUMB_CACHE;
		$this->thumbs_href = CACHE_HREF . Thumb::$THUMB_CACHE;

		if (!is_dir($this->thumbs_path)) {
			@mkdir($this->thumbs_path, 0755, true);
		}
	}


	public function thumb($type, $source_url, $mode, $width, $height) {

		$source_path = $this->app->to_path($source_url);
		if (!file_exists($source_path) || starts_with($source_path, CACHE_PATH)) {
			return null;
		}

		if ($type === "img") {
			$capture_path = $source_path;
		} else if ($type === "mov") {
			if (HAS_CMD_AVCONV) {
				$capture_path = $this->capture(Thumb::$AVCONV_CMDV, $source_path);
			} else if (HAS_CMD_FFMPEG) {
				$capture_path = $this->capture(Thumb::$FFMPEG_CMDV, $source_path);
			}
		} else if ($type === "doc" && HAS_CMD_CONVERT) {
			$capture_path = $this->capture(Thumb::$CONVERT_CMDV, $source_path);
		}

		return $this->thumb_href($capture_path, $mode, $width, $height);
	}


	private function thumb_href($source_path, $mode, $width, $height) {

		if (!file_exists($source_path)) {
			return null;
		}

		$name = "thumb-" . sha1("$source_path-$width-$height-$mode") . ".jpg";
		$thumb_path = $this->thumbs_path . "/" . $name;
		$thumb_url = $this->thumbs_href . "/" . $name;

		if (!file_exists($thumb_path) || filemtime($source_path) >= filemtime($thumb_path)) {

			$image = new Image();

			$et = false;
			$opts = $this->app->get_options();
			if (HAS_PHP_EXIF && $opts["thumbnails"]["exif"] === true) {
				$et = @exif_thumbnail($source_path);
			}
			if($et !== false) {
				file_put_contents($thumb_path, $et);
				$image->set_source($thumb_path);
				$image->normalize_exif_orientation($source_path);
			} else {
				$image->set_source($source_path);
			}

			$image->thumb($mode, $width, $height);
			$image->save_dest_jpeg($thumb_path, 80);
		}

		return file_exists($thumb_path) ? $thumb_url : null;
	}


	private function capture($cmdv, $source_path) {

		if (!file_exists($source_path)) {
			return null;
		}

		$capture_path = $this->thumbs_path . "/capture-" . sha1($source_path) . ".jpg";

		if (!file_exists($capture_path) || filemtime($source_path) >= filemtime($capture_path)) {

			foreach ($cmdv as &$arg) {
				$arg = str_replace("[SRC]", $source_path, $arg);
				$arg = str_replace("[DEST]", $capture_path, $arg);
			}

			exec_cmdv($cmdv);
		}

		return file_exists($capture_path) ? $capture_path : null;
	}
}
