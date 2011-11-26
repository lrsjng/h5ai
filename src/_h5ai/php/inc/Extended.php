<?php

require_once "Thumbnail.php";


class Entry {
    private $h5ai, $label, $absPath, $absHref, $date, $isFolder, $type, $size, $thumbTypes;

    public function __construct($h5ai, $absPath, $absHref, $type = null, $label = null) {

        $this->h5ai = $h5ai;
        $this->label = $label !== null ? $label : $this->h5ai->getLabel($absHref);
        $this->absPath = $this->h5ai->normalizePath($absPath, false);
        $this->isFolder = is_dir($this->absPath);
        $this->absHref = $this->h5ai->normalizePath($absHref, $this->isFolder);

        $this->date = filemtime($this->absPath);

        if ($this->isFolder) {
            $this->type = $type !== null ? $type : "folder";
            $this->size = "";
        } else {
            $this->type = $type !== null ? $type : $this->h5ai->getType($this->absPath);
            $this->size = filesize($this->absPath);
        }

        $this->thumbTypes = array("bmp", "gif", "ico", "image", "jpg", "png", "tiff");
    }

    public function isFolder() {

        return $this->isFolder;
    }

    public function toHtml() {

        $classes = "entry " . ($this->isFolder ? "folder " : "file ") . $this->type;
        $imgClass = "";
        $img = $this->type;
        $smallImg = $this->h5ai->icon($this->type);
        $bigImg = $this->h5ai->icon($this->type, true);
        $hint = "";

        if ($this->isFolder && $this->type !== "folder-parent") {
            $code = $this->h5ai->getHttpCode($this->absHref);
            $classes .= " checkedHttpCode";
            if ($code !== "h5ai") {
                if ($code === 200) {
                    $img = "folder-page";
                    $smallImg = $this->h5ai->icon("folder-page");
                    $bigImg = $this->h5ai->icon("folder-page", true);
                } else {
                    $classes .= " error";
                    $hint = "<span class='hint'> " . $code . " </span>";
                }
            }
        }
        if ($this->h5ai->showThumbs() && in_array($this->type, $this->thumbTypes)) {
            $imgClass = " class='thumb' ";
            $thumbnail = new Thumbnail($this->h5ai, $this->absHref, "square", 16, 16);
            $thumbnail->create();
            $smallImg = file_exists($thumbnail->getPath()) ? $thumbnail->getHref() : $thumbnail->getLiveHref();
            $thumbnail = new Thumbnail($this->h5ai,$this->absHref, "rational", 96, 46);
            $thumbnail->create();
            $bigImg = file_exists($thumbnail->getPath()) ? $thumbnail->getHref() : $thumbnail->getLiveHref();
        }

        $html = "\t<li class='" . $classes . "'>\n";
        $html .= "\t\t<a href='" . $this->absHref . "'>\n";
        $html .= "\t\t\t<span class='icon small'><img " . $imgClass . " src='" . $smallImg . "' alt='" . $img . "' /></span>\n";
        $html .= "\t\t\t<span class='icon big'><img " . $imgClass . " src='" . $bigImg . "' alt='" . $img . "' /></span>\n";
        $html .= "\t\t\t<span class='label'>" . $this->label . $hint . "</span>\n";
        $html .= "\t\t\t<span class='date' data-time='" . $this->date . "000'></span>\n";
        $html .= "\t\t\t<span class='size' data-bytes='" . $this->size . "'>" . $this->size . "</span>\n";
        $html .= "\t\t</a>\n";
        $html .= "\t</li>\n";
        return $html;
    }
}


class Extended {
    private $h5ai, $parent, $content;

    public function __construct($h5ai) {

        $this->h5ai = $h5ai;
        $this->parent = null;
        $this->content = array();
        $this->loadContent();
    }

    private function loadContent() {

        if ($this->h5ai->getAbsHref() !== "/") {
            $options = $this->h5ai->getOptions();
            $parentPath = dirname($this->h5ai->getAbsPath());
            $parentHref = dirname($this->h5ai->getAbsHref());
            $label = $options["setParentFolderLabels"] === true ? $this->h5ai->getLabel($parentHref) : "<span class='l10n-parentDirectory'>Parent Directory</span>";
            $this->parent = new Entry($this->h5ai, $parentPath, $parentHref, "folder-parent", $label);
        }

        $this->content = array();

        $files = $this->h5ai->readDir($this->h5ai->getAbsPath());
        foreach ($files as $file) {
            $absPath = $this->h5ai->getAbsPath() . "/" . $file;
            $absHref = $this->h5ai->getAbsHref() . rawurlencode($file);
            $this->content[$absPath] = new Entry($this->h5ai, $absPath, $absHref);
        }
    }

    public function toHtml() {

        $html = "<section id='extended' class='" . $this->h5ai->getView() . "-view clearfix'>\n";
        $html .= "<ul>\n";
        $html .= $this->generateHeaders();
        if ($this->parent !== null) {
            $html .= $this->parent->toHtml();
        }
        foreach($this->content as $entry) {
            $html .= $entry->toHtml();
        }
        $html .= "</ul>\n";
        if (count($this->content) === 0) {
            $html .= "<div class='empty l10n-empty'>empty</div>";
        }
        $html .="</section>";
        return $html;
    }

    public function generateHeaders() {

        $html = "\t<li class='header'>\n";
        $html .= "\t\t<a class='icon'></a>\n";
        $html .= "\t\t<a class='label' href='#'><span class='l10n-name'>Name</span></a>\n";
        $html .= "\t\t<a class='date' href='#'><span class='l10n-lastModified'>Last modified</span></a>\n";
        $html .= "\t\t<a class='size' href='#'><span class='l10n-size'>Size</span></a>\n";
        $html .= "\t</li>\n";
        return $html;
    }
}

?>