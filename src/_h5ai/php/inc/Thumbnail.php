<?php

require_once "Image.php";


class Thumbnail {

    private $srcAbsHref, $srcAbsPath, $width, $height, $name, $href, $path;

    public static function isUsable() {

        return Image::isUsable();
    }

    public function __construct($h5ai, $absHref, $mode, $width, $height) {

        $this->h5ai = $h5ai;
        $this->srcAbsHref = $absHref;
        $this->srcAbsPath = $this->h5ai->getDocRoot() . urldecode($absHref);
        $this->width = $width;
        $this->height = $height;
        $this->mode = $mode;
        $this->name = sha1("$this->srcAbsPath-$this->width-$this->height-$this->mode");
        $this->href = $this->h5ai->getH5aiAbsHref() . "/cache/thumb-" . $this->name . ".jpg";
        $this->path = $this->h5ai->getDocRoot() . $this->href;
        $this->liveHref = $this->h5ai->api() . "?action=thumb&href=" . $this->srcAbsHref . "&width=" . $this->width . "&height=" . $this->height . "&mode=" . $this->mode;
    }

    public function create($force = 0) {

        if (
            $force === 2
            || ($force === 1 && !file_exists($this->path))
            || (file_exists($this->path) && filemtime($this->srcAbsPath) >= filemtime($this->path))
       ) {
            $image = new Image();
            $image->setSource($this->srcAbsPath);
            $image->thumb($this->mode, $this->width, $this->height);
            $image->saveDest($this->path);
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