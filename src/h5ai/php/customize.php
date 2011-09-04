<?php

class Customize {
    private $h5ai;

    public function __construct($h5ai) {

        $this->h5ai = $h5ai;
    }

    public function getHeader() {

        return $this->getContent($this->h5ai->getAbsPath() . "/" . "h5ai.header.html", "header");
    }

    public function getFooter() {

        return $this->getContent($this->h5ai->getAbsPath() . "/" . "h5ai.footer.html", "footer");
    }

    private function getContent($file, $tag) {

        return file_exists($file) ? ("<" . $tag . ">" . file_get_contents($file) . "</" . $tag . ">") : "";
    }
}

?>