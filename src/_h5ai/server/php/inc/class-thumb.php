<?php

class Thumb {

    private static $FFMPEG_CMDV = array("ffmpeg", "-ss", "0:00:10", "-i", "[SRC]", "-an", "-vframes", "1", "[DEST]");
    private static $AVCONV_CMDV = array("avconv", "-ss", "0:00:10", "-i", "[SRC]", "-an", "-vframes", "1", "[DEST]");
    private static $CONVERT_CMDV = array("convert", "-density", "200", "-quality", "100", "-sharpen", "0x1.0", "-strip", "[SRC][0]", "[DEST]");
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


    public function thumb($type, $source_url, $width, $height) {

        $source_path = $this->app->to_path($source_url);
        if (!file_exists($source_path) || Util::starts_with($source_path, CACHE_PATH)) {
            return null;
        }

        $capture_path = $source_path;
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

        return $this->thumb_href($capture_path, $width, $height);
    }


    private function thumb_href($source_path, $width, $height) {

        if (!file_exists($source_path)) {
            return null;
        }

        $name = "thumb-" . sha1("$source_path") . "-" . $width . "x" . $height . ".jpg";
        $thumb_path = $this->thumbs_path . "/" . $name;
        $thumb_url = $this->thumbs_href . "/" . $name;

        if (!file_exists($thumb_path) || filemtime($source_path) >= filemtime($thumb_path)) {

            $image = new Image();

            $et = false;
            $opts = $this->app->get_options();
            if (HAS_PHP_EXIF && $opts["thumbnails"]["exif"] === true && $height != 0) {
                $et = @exif_thumbnail($source_path);
            }
            if($et !== false) {
                file_put_contents($thumb_path, $et);
                $image->set_source($thumb_path);
                $image->normalize_exif_orientation($source_path);
            } else {
                $image->set_source($source_path);
            }

            $image->thumb($width, $height);
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

            Util::exec_cmdv($cmdv);
        }

        return file_exists($capture_path) ? $capture_path : null;
    }
}


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


    public function thumb($width, $height) {

        if (is_null($this->source)) {
            return;
        }

        $src_r = 1.0 * $this->width / $this->height;

        if ($height == 0) {
            if ($src_r >= 1) {
                $height = 1.0 * $width / $src_r;
            } else {
                $height = $width;
                $width = 1.0 * $height * $src_r;
            }
            if ($width > $this->width) {
                $width = $this->width;
                $height = $this->height;
            }
        }

        $ratio = 1.0 * $width / $height;

        if ($src_r <= $ratio) {
            $src_w = $this->width;
            $src_h = $src_w / $ratio;
            $src_x = 0;
        } else {
            $src_h = $this->height;
            $src_w = $src_h * $ratio;
            $src_x = 0.5 * ($this->width - $src_w);
        }

        $width = intval($width);
        $height = intval($height);
        $src_x = intval($src_x);
        $src_w = intval($src_w);
        $src_h = intval($src_h);

        $this->dest = imagecreatetruecolor($width, $height);
        $icol = imagecolorallocate($this->dest, 255, 255, 255);
        imagefill($this->dest, 0, 0, $icol);
        imagecopyresampled($this->dest, $this->source, 0, 0, $src_x, 0, $width, $height, $src_w, $src_h);
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
