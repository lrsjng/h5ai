<?php

class Customize {
    private $customHeader, $customFooter;

    public function __construct($h5ai) {

        $absPath = $h5ai->getAbsPath();
        $options = $h5ai->getOptions();
        $this->customHeader = $absPath . DIRECTORY_SEPARATOR . $options["customHeader"];
        $this->customFooter = $absPath . DIRECTORY_SEPARATOR . $options["customFooter"];
    }

    public function getHeader() {

        return $this->getContent($this->customHeader, "header");
    }

    public function getFooter() {

        return $this->getContent($this->customFooter, "footer");
    }

    private function getContent($file, $tag) {

        return file_exists($file) ? ("<" . $tag . ">" . file_get_contents($file) . "</" . $tag . ">") : "";
    }
}

?>