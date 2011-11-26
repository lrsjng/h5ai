<?php

class Image {

    private $sourceFile;
    private $source;
    private $width;
    private $height;
    private $type;

    private $dest;


    public static function isUsable() {

        return GD_VERSION != "GD_VERSION";
    }


    public static function showImage($filename) {

        $image = file_get_contents($filename);
        header("content-type: image");
        echo $image;
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

        list($this->width, $this->height, $this->type) = getimagesize($this->sourceFile);

        $this->source = imagecreatefromstring(file_get_contents($this->sourceFile));
    }


    public function showDest() {

        if (!is_null($this->dest)) {
            header("Content-type: image/jpeg");
            imagejpeg($this->dest, null, 100);
        }
    }


    public function saveDest($filename) {

        if (!is_null($this->dest)) {
            @imagejpeg($this->dest, $filename, 90);
            @chmod($filename, 0775);
        }
    }


    public function releaseDest() {

        if (!is_null($this->dest)) {
            imagedestroy($this->dest);
            $this->dest = null;
        }
    }


    public function releaseSource() {

        if (!is_null($this->source)) {
            imagedestroy($this->source);
            $this->sourceFile = null;
            $this->source = null;
            $this->width = null;
            $this->height = null;
            $this->type = null;
        }
    }


    private function magic($destX, $destY, $srcX, $srcY, $destWidth, $destHeight, $srcWidth, $srcHeight, $canWidth = null, $canHeight = null, $color = null) {

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

        $a = min($this->width, $this->height);
        $x = intval(($this->width - $a) / 2);
        $y = intval(($this->height - $a) / 2);

        $this->magic(0, 0, $x, $y, $width, $width, $a, $a);
    }


    public function rationalThumb($width, $height) {

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

        $w = intval($width);
        $h = intval($height);

        $this->magic(0, 0, 0, 0, $w, $h, $this->width, $this->height);
    }
}

?>